import { PatientRequestRepository } from '../../modules/patient/repositories/patient_request.repository';
import { getConnection, Like } from 'typeorm';
import { PatientRequest } from '../../modules/patient/entities/patient_requests.entity';
import { Immunization } from '../../modules/patient/immunization/entities/immunization.entity';
import { Stock } from '../../modules/inventory/entities/stock.entity';
import * as moment from 'moment';

export class PatientRequestHelper {
    constructor(private patientRequestRepo: PatientRequestRepository) {
    }

    static async handleLabRequest(param, patient, createdBy) {
        const { requestBody, id, request_note } = param;
        const data = {
            requestType: 'lab',
            requestBody,
            patient,
            requestNote: request_note,
            createdBy: '',
            lastChangedBy: '',
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
            return { success: true, data: res };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    static async handlePharmacyRequest(param, patient, createdBy) {
        const { requestType, requestBody, request_note, id } = param;
        const data = {
            requestType: 'pharmacy',
            requestBody,
            patient,
            createdBy: '',
            lastChangedBy: '',
            requestNote: request_note,
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
            return { success: true, data: res };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    static async handleVaccinationRequest(param, patient, createdBy) {
        const { requestType, requestBody, request_note } = param;

        const dateDue = requestBody.due_date;
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
            requestBody: body,
            patient,
            createdBy,
        };

        let res;
        try {
            res = await this.save(data);
            return { success: true, data: res };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    static async handlePhysiotherapyRequest(param, patient, createdBy) {
        const { requestType, requestBody, request_note, id } = param;
        const data = {
            requestType: 'physiotherapy',
            requestBody,
            patient,
            createdBy: '',
            lastChangedBy: '',
            requestNote: request_note,
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
            return { success: true, data: res };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    static async handleOpthalmolgyRequest(param, patient, createdBy) {
        const { requestType, requestBody, request_note, id } = param;
        const data = {
            requestType: 'opthalmology',
            requestBody,
            patient,
            createdBy: '',
            lastChangedBy: '',
            requestNote: request_note,
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
            return { success: true, data: res };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    static async handleDentistryRequest(param, patient, createdBy) {
        const { requestType, requestBody, request_note, id } = param;
        const data = {
            requestType: 'dentistry',
            requestBody,
            patient,
            createdBy: '',
            lastChangedBy: '',
            requestNote: request_note,
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
            return { success: true, data: res };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    static async handleImagingRequest(param, patient, createdBy) {
        const { requestType, requestBody, request_note, id } = param;
        const data = {
            requestType: 'imaging',
            requestBody,
            patient,
            createdBy: '',
            lastChangedBy: '',
            requestNote: request_note,
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
            return { success: true, data: res };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    static async handleProcedureRequest(param, patient, createdBy) {
        const { requestType, requestBody, request_note, id } = param;
        const data = {
            requestType: 'procedure',
            requestBody,
            patient,
            createdBy: '',
            lastChangedBy: '',
            requestNote: request_note,
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
            return { success: true, data: res };
        } catch (error) {
            return { success: false, message: error.message };
        }
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
