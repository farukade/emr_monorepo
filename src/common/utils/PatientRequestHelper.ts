import { PatientRequestRepository } from '../../modules/patient/repositories/patient_request.repository';
import { getConnection } from 'typeorm';
import { PatientRequest } from '../../modules/patient/entities/patient_requests.entity';
import { Immunization } from '../../modules/patient/immunization/entities/immunization.entity';
import * as moment from 'moment';
import { PatientRequestItem } from '../../modules/patient/entities/patient_request_items.entity';
import { LabTest } from '../../modules/settings/entities/lab_test.entity';
import { Service } from '../../modules/settings/entities/service.entity';
import { PatientDiagnosis } from '../../modules/patient/entities/patient_diagnosis.entity';
import { Stock } from '../../modules/inventory/entities/stock.entity';

export class PatientRequestHelper {
    constructor(private patientRequestRepo: PatientRequestRepository) {
    }

    static async handleLabRequest(param, patient, createdBy) {
        const { requestType, request_note, tests, urgent } = param;

        try {
            const requestCount = await getConnection()
                .createQueryBuilder()
                .select('*')
                .from(PatientRequest, 'q')
                .where('q.requestType = :type', { type: 'lab' })
                .getCount();

            const nextId = `00000${requestCount + 1}`;
            const code = `DH/${moment().format('MM')}/${nextId.slice(-5)}`;

            let result = [];
            for (const item of tests) {
                const data = {
                    code,
                    requestType,
                    patient,
                    requestNote: request_note,
                    createdBy,
                    urgent,
                };
                const res = await this.save(data);
                const lab = res.generatedMaps[0];

                const labTest = await getConnection().getRepository(LabTest).findOne(item.id);

                const requestItem = {
                    request: lab,
                    labTest,
                };
                const rs = await this.saveItem(requestItem);

                lab.items = [rs.generatedMaps[0]];

                result = [...result, lab];
            }

            return { success: true, data: result };
        } catch (error) {
            console.log(error);
            return { success: false, message: error.message };
        }
    }

    static async handlePharmacyRequest(param, patient, createdBy) {
        const { requestType, request_note, items, id } = param;

        const data = {
            requestType,
            patient,
            requestNote: request_note,
            createdBy,
            lastChangedBy: null,
        };

        let res;
        try {
            if (id && id !== '') {
                data.lastChangedBy = createdBy;
                res = await this.update(data, id);
            } else {
                data.createdBy = createdBy;
                res = await this.save(data);
            }

            const regimen = res.generatedMaps[0];

            let result = [];
            // tslint:disable-next-line:no-empty
            if (id && id !== '') {
            } else {
                let regimenItems = [];
                for (const item of items) {
                    const drug = await getConnection().getRepository(Stock).findOne(item.drug_id);

                    let refills = 0;
                    try {
                        refills = item.refills ? parseInt(item.refills, 10) : 0;
                    } catch (e) {
                        refills = 0;
                    }

                    const requestItem = {
                        request: regimen,
                        drug,
                        doseQuantity: item.dose_quantity,
                        refillable: refills > 0,
                        refills,
                        frequency: item.frequency,
                        frequencyType: item.frequencyType,
                        duration: item.duration,
                        externalPrescription: item.prescription,
                        note: item.regimenInstruction,
                    };

                    const rs = await this.saveItem(requestItem);
                    const reqItem = rs.generatedMaps[0];

                    let diags = [];
                    if (item.diagnosis) {
                        for (const diag of item.diagnosis) {
                            const i = new PatientDiagnosis();
                            i.request = reqItem;
                            i.patient = patient;
                            i.item = diag;
                            await i.save();

                            diags = [...diags, i];
                        }
                    }

                    regimenItems = [...regimenItems, { ...reqItem, diagnosis: diags }];
                }

                regimen.items = regimenItems;
            }

            result = [...result, regimen];

            return { success: true, data: result };
        } catch (error) {
            console.log(error);
            return { success: false, message: error.message };
        }
    }

    static async handleVaccinationRequest(param, patient, createdBy) {
        const { requestType, request, request_note } = param;

        const dateDue = request.due_date;
        const vaccines = await getConnection()
            .getRepository(Immunization)
            .find({ date_due: dateDue, patient });

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

        const data = {
            requestType: 'pharmacy',
            patient,
            createdBy,
        };

        try {
            const res = await this.save(data);
            const regimen = res.generatedMaps[0];

            let result = [];

            let regimenItems = [];
            for (const item of body) {
                const requestItem = {
                    request: regimen,
                    doseQuantity: item.dose_quantity,
                    refillable: false,
                    refills: 0,
                    frequency: item.frequency,
                    frequencyType: item.frequencyType,
                    duration: item.duration,
                    externalPrescription: 'No',
                };

                const rs = await this.saveItem(requestItem);
                const reqItem = rs.generatedMaps[0];

                regimenItems = [...regimenItems, reqItem];
            }

            regimen.items = regimenItems;

            result = [...result, regimen];

            return { success: true, data: result };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    static async handleServiceRequest(param, patient, createdBy, type) {
        const { requestType, request_note, tests, diagnosis, urgent } = param;

        try {
            const requestCount = await getConnection()
                .createQueryBuilder()
                .select('*')
                .from(PatientRequest, 'q')
                .where('q.requestType = :type', { type })
                .getCount();

            const nextId = `00000${requestCount + 1}`;
            const code = `DH/${moment().format('MM')}/${nextId.slice(-5)}`;

            let result = [];
            for (const item of tests) {
                const data = {
                    code,
                    requestType,
                    patient,
                    urgent,
                    requestNote: request_note,
                    createdBy,
                };
                const res = await this.save(data);
                const request = res.generatedMaps[0];

                const service = await getConnection().getRepository(Service).findOne(item.id);

                const requestItem = {
                    request,
                    service,
                };
                const rs = await this.saveItem(requestItem);

                const requestItems = [rs.generatedMaps[0]];

                let items = [];
                if (diagnosis) {
                    for (const reqItem of requestItems) {
                        let diags = [];
                        for (const diag of diagnosis) {
                            const i = new PatientDiagnosis();
                            i.request = reqItem;
                            i.patient = patient;
                            i.item = diag;
                            await i.save();

                            diags = [...diags, i];
                        }

                        items = [...items, { ...reqItem, diagnosis: diags }];
                    }
                }

                request.items = items;

                result = [...result, request];
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
