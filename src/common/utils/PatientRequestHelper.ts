import { PatientRequestRepository } from '../../modules/patient/repositories/patient_request.repository';
import { getConnection } from 'typeorm';
import { PatientRequest } from '../../modules/patient/entities/patient_requests.entity';

export class PatientRequestHelper {
    constructor(private patientRequestRepo: PatientRequestRepository) { }

    static async handleLabRequest(param, patient, createdBy) {
        const {requestBody, id, request_note} = param;
        const data = {
            requestType: 'lab',
            requestBody,
            patient,
            requestNote: request_note,
            createdBy : '',
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
            return {success: true, data: res};
        } catch (error) {
            return {success: false, message: error.message};
        }
    }

    static async handlePharmacyRequest(param, patient, createdBy) {
        const {requestType, requestBody, request_note, id} = param;
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
            return {success: true, data: res};
        } catch (error) {
            return {success: false, message: error.message};
        }
    }

    static async handlePhysiotherapyRequest(param, patient, createdBy) {
        const {requestType, requestBody, request_note, id} = param;
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
            return {success: true, data: res};
        } catch (error) {
            return {success: false, message: error.message};
        }
    }

    static async handleOpthalmolgyRequest(param, patient, createdBy) {
        const {requestType, requestBody, request_note, id} = param;
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
            return {success: true, data: res};
        } catch (error) {
            return {success: false, message: error.message};
        }
    }

    static async handleDentistryRequest(param, patient, createdBy) {
        const {requestType, requestBody, request_note, id} = param;
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
            return {success: true, data: res};
        } catch (error) {
            return {success: false, message: error.message};
        }
    }

    static async handleImagingRequest(param, patient, createdBy) {
        const {requestType, requestBody, request_note, id} = param;
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
            return {success: true, data: res};
        } catch (error) {
            return {success: false, message: error.message};
        }
    }

    static async handleProcedureRequest(param, patient, createdBy) {
        const {requestType, requestBody, request_note, id} = param;
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
            return {success: true, data: res};
        } catch (error) {
            return {success: false, message: error.message};
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
