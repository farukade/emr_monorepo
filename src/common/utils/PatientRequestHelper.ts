import { PatientRequestRepository } from '../../modules/patient/repositories/patient_request.repository';
import { getConnection } from 'typeorm';
import { PatientRequest } from '../../modules/patient/entities/patient_requests.entity';
import { Immunization } from '../../modules/patient/immunization/entities/immunization.entity';
import * as moment from 'moment';
import { PatientRequestItem } from '../../modules/patient/entities/patient_request_items.entity';
import { LabTest } from '../../modules/settings/entities/lab_test.entity';
import { Drug } from '../../modules/inventory/entities/drug.entity';
import { ServiceCost } from '../../modules/settings/entities/service_cost.entity';
import { DrugGeneric } from '../../modules/inventory/entities/drug_generic.entity';
import { PatientNote } from '../../modules/patient/entities/patient_note.entity';
import { Admission } from '../../modules/patient/admissions/entities/admission.entity';
import { AntenatalEnrollment } from '../../modules/patient/antenatal/entities/antenatal-enrollment.entity';
import { IvfEnrollment } from '../../modules/patient/ivf/entities/ivf_enrollment.entity';
import { createServiceCost, getSerialCode } from './utils';
import { Nicu } from '../../modules/patient/nicu/entities/nicu.entity';
import { Patient } from '../../modules/patient/entities/patient.entity';
import { PatientAlert } from '../../modules/patient/entities/patient_alert.entity';

export class PatientRequestHelper {
    constructor(private patientRequestRepo: PatientRequestRepository) {
    }

    static async handleLabRequest(param: any, patient: Patient, createdBy: string, encounter = null) {
        const { requestType, request_note, tests, urgent, antenatal_id, admission_id, nicu_id, ivf_id } = param;

        try {
            const serialCode = await getSerialCode(requestType);
            const nextId = `00000${serialCode}`;
            const code = `LR${moment().format('YY')}/${moment().format('MM')}/${nextId.slice(-5)}`;

            // modules
            let antenatal = null;
            if (antenatal_id && antenatal_id !== '') {
                antenatal = await getConnection().getRepository(AntenatalEnrollment).findOne(antenatal_id);
            }

            let admission = null;
            if (admission_id && admission_id !== '') {
                admission = await getConnection().getRepository(Admission).findOne(admission_id);
            }

            let nicu = null;
            if (nicu_id && nicu_id !== '') {
                nicu = await getConnection().getRepository(Nicu).findOne(nicu_id);
            }

            let ivf = null;
            if (ivf_id && ivf_id !== '') {
                ivf = await getConnection().getRepository(IvfEnrollment).findOne(ivf_id);
            }

            let result = [];
            for (const item of tests) {
                const data = {
                    code,
                    serial_code: serialCode,
                    patient,
                    requestType,
                    requestNote: request_note,
                    urgent,
                    admission,
                    antenatal,
                    createdBy,
                    ivf,
                    nicu,
                    encounter,
                };
                const res = await this.save(data);
                const lab = res.generatedMaps[0];

                const labTest = await getConnection().getRepository(LabTest).findOne(item.id);

                const requestItem = {
                    request: lab,
                    labTest,
                    createdBy,
                };
                const rs = await this.saveItem(requestItem);

                lab.item = rs.generatedMaps[0];

                result = [...result, lab];
            }

            return { success: true, data: result };
        } catch (error) {
            console.log(error);
            return { success: false, message: error.message };
        }
    }

    static async handlePharmacyRequest(param: any, patient: Patient, createdBy: string, visit = '', encounter = null) {
        const { requestType, request_note, items, procedure_id, antenatal_id, admission_id, nicu_id } = param;
        try {
            const serialCode = await getSerialCode(requestType);
            const nextId = `00000${serialCode}`;
            const code = `DR${moment().format('YY')}/${moment().format('MM')}/${nextId.slice(-5)}`;

            // modules
            let antenatal = null;
            if (antenatal_id && antenatal_id !== '') {
                antenatal = await getConnection().getRepository(AntenatalEnrollment).findOne(antenatal_id);
            }

            let admission = null;
            if (admission_id && admission_id !== '') {
                admission = await getConnection().getRepository(Admission).findOne(admission_id);
            }

            let nicu = null;
            if (nicu_id && nicu_id !== '') {
                nicu = await getConnection().getRepository(Nicu).findOne(nicu_id);
            }

            let result = [];
            for (const item of items) {
                const data = {
                    code,
                    serial_code: serialCode,
                    patient,
                    requestType,
                    requestNote: request_note,
                    createdBy,
                    lastChangedBy: null,
                    antenatal,
                    admission,
                    nicu,
                    procedure_id: procedure_id && procedure_id !== '' ? procedure_id : null,
                    encounter,
                };
                const res = await this.save(data);
                const regimen = res.generatedMaps[0];

                const generic = item.generic ? await getConnection().getRepository(DrugGeneric).findOne(item.generic?.id) : null;
                const drug = item.drug ? await getConnection().getRepository(Drug).findOne(item.drug?.id) : null;

                let refills = 0;
                try {
                    refills = item.refills ? parseInt(item.refills, 10) : 0;
                } catch (e) {
                    refills = 0;
                }

                const requestItem = {
                    request: regimen,
                    drug,
                    drugGeneric: generic,
                    doseQuantity: item.dose_quantity,
                    refillable: refills > 0,
                    refills,
                    frequency: item.frequency,
                    frequencyType: item.frequencyType,
                    duration: item.duration,
                    externalPrescription: item.prescription,
                    note: item.regimenInstruction,
                    createdBy,
                };

                const rs = await this.saveItem(requestItem);
                const reqItem = rs.generatedMaps[0];

                let diags = [];
                if (item.diagnosis) {
                    for (const diag of item.diagnosis) {
                        if (diag.diagnosis) {
                            const i = new PatientNote();
                            i.diagnosis = diag.diagnosis;
                            i.status = 'Active';
                            i.patient = patient;
                            i.request = reqItem;
                            i.diagnosis_type = diag.type.value;
                            i.comment = diag.comment;
                            i.visit = visit;
                            i.type = 'diagnosis';
                            i.createdBy = createdBy;
                            i.admission = admission;
                            const note = await i.save();

                            if (diag?.status === 'critical') {
                                const alert = new PatientAlert();
                                alert.patient = patient;
                                alert.category = diag.status;
                                alert.type = diag.condition.value;
                                alert.source = 'diagnosis';
                                alert.item_id = note.id;
                                alert.message = `patient has been diagnosed of ${diag.condition.label}`;
                                alert.createdBy = createdBy;
                                await alert.save();
                            }

                            diags = [...diags, i];
                        }
                    }
                }

                regimen.item = { ...reqItem, diagnosis: diags };

                result = [...result, regimen];
            }

            return { success: true, data: result };
        } catch (error) {
            console.log(error);
            return { success: false, message: error.message };
        }
    }

    static async handleVaccinationRequest(param, patient, createdBy, ) {
        const { date_due } = param;

        const serialCode = await getSerialCode('drugs');
        const nextId = `00000${serialCode}`;
        const code = `PR${moment().format('YY')}/${moment().format('MM')}/${nextId.slice(-5)}`;

        const vaccines = await getConnection()
            .getRepository(Immunization)
            .find({ date_due, patient });

        let body = [];

        let i = 0;
        for (const vaccine of vaccines) {
            i++;
            body = [...body, {
                id: i,
                drug_id: '',
                duration: '1',
                diagnosis: '',
                drug_name: '',
                drug_cost: '',
                drug_hmo_id: patient.hmo.id,
                drug_hmo_cost: '',
                frequency: '1',
                regimenNote: '',
                prescription: 0,
                dose_quantity: '1',
                frequencyType: 'immediately',
                drug_generic_name: '',
                vaccine,
            }];

            await getConnection()
                .createQueryBuilder()
                .update(Immunization)
                .set({ appointment_date: moment().format('YYYY-MM-DD HH:mm:ss') })
                .where('id = :id', { id: vaccine.id })
                .execute();
        }

        try {
            let result = [];
            for (const item of body) {
                const data = {
                    code,
                    serial_code: serialCode,
                    patient,
                    requestType: 'drugs',
                    requestNote: 'immunization',
                    createdBy,
                    lastChangedBy: null,
                };
                const res = await this.save(data);
                const regimen = res.generatedMaps[0];

                const requestItem = {
                    request: regimen,
                    doseQuantity: item.dose_quantity,
                    refillable: false,
                    refills: 0,
                    frequency: item.frequency,
                    frequencyType: item.frequencyType,
                    duration: item.duration,
                    externalPrescription: 'No',
                    vaccine: item.vaccine,
                    createdBy,
                };

                const rs = await this.saveItem(requestItem);
                const reqItem = rs.generatedMaps[0];

                regimen.item = { ...reqItem };

                result = [...result, regimen];
            }

            return { success: true, data: result };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    static async handleServiceRequest(param, patient, createdBy, type, visit = '', encounter = null) {
        const { requestType, request_note, tests, diagnosis, urgent, antenatal_id, admission_id, procedure_id, nicu_id } = param;

        try {
            const serialCode = await getSerialCode(type);
            const nextId = `00000${serialCode}`;
            const code = `${requestType.toUpperCase().substring(0, 1)}R${moment().format('YY')}/${moment().format('MM')}/${nextId.slice(-5)}`;

            const hmo = patient.hmo;

            // modules
            let antenatal = null;
            if (antenatal_id && antenatal_id !== '') {
                antenatal = await getConnection().getRepository(AntenatalEnrollment).findOne(antenatal_id);
            }

            let admission = null;
            if (admission_id && admission_id !== '') {
                admission = await getConnection().getRepository(Admission).findOne(admission_id);
            }

            let nicu = null;
            if (nicu_id && nicu_id !== '') {
                nicu = await getConnection().getRepository(Nicu).findOne(nicu_id);
            }

            let result = [];
            for (const item of tests) {
                console.log(item);
                if (item && item.code) {
                    const data = {
                        code,
                        serial_code: serialCode,
                        patient,
                        requestType,
                        requestNote: request_note,
                        urgent,
                        createdBy,
                        admission,
                        nicu,
                        antenatal,
                        procedure_id: procedure_id && procedure_id !== '' ? procedure_id : null,
                        encounter,
                    };

                    const res = await this.save(data);
                    const request = res.generatedMaps[0];

                    let service = await getConnection().getRepository(ServiceCost).findOne({
                        where: { code: item.code, hmo },
                    });
                    if (!service) {
                        service = await createServiceCost(item.code, hmo);
                    }

                    const requestItem = {
                        request,
                        service,
                        createdBy,
                    };
                    const rs = await this.saveItem(requestItem);

                    const requestItems = [rs.generatedMaps[0]];

                    let items = [];
                    if (diagnosis) {
                        for (const reqItem of requestItems) {
                            let diags = [];
                            for (const diag of diagnosis) {
                                if (diag.diagnosis) {
                                    const i = new PatientNote();
                                    i.diagnosis = diag.diagnosis;
                                    i.status = 'Active';
                                    i.patient = patient;
                                    i.request = reqItem;
                                    i.diagnosis_type = diag.type.value;
                                    i.comment = diag.comment;
                                    i.visit = visit;
                                    i.type = 'diagnosis';
                                    i.createdBy = createdBy;
                                    i.admission = admission;
                                    const note = await i.save();

                                    if (diag?.status === 'critical') {
                                        const alert = new PatientAlert();
                                        alert.patient = patient;
                                        alert.category = diag.status;
                                        alert.type = diag.condition.value;
                                        alert.source = 'diagnosis';
                                        alert.item_id = note.id;
                                        alert.message = `patient has been diagnosed of ${diag.condition.label}`;
                                        alert.createdBy = createdBy;
                                        await alert.save();
                                    }

                                    diags = [...diags, i];
                                }
                            }

                            items = [...items, { ...reqItem, diagnosis: diags }];
                        }
                    }

                    request.items = items;

                    result = [...result, request];
                }
            }

            return { success: true, data: result };
        } catch (error) {
            console.log(error);
            return { success: false, message: error.message };
        }
    }

    static async saveItem(data): Promise<any> {
        return await getConnection()
            .createQueryBuilder()
            .insert()
            .into(PatientRequestItem)
            .values(data)
            .returning('*')
            .execute();
    }

    static async save(data): Promise<any> {
        return await getConnection()
            .createQueryBuilder()
            .insert()
            .into(PatientRequest)
            .values(data)
            .returning('*')
            .execute();
    }

    static async update(data, id): Promise<any> {
        return await getConnection()
            .createQueryBuilder()
            .update(PatientRequest)
            .set(data)
            .where('id = :id', { id })
            .execute();
    }
}
