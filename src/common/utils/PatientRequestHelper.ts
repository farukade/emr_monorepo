import { PatientRequestRepository } from '../../modules/patient/repositories/patient_request.repository';
import { getConnection } from 'typeorm';
import { PatientRequest } from '../../modules/patient/entities/patient_requests.entity';

export class PatientRequestHelper {
    constructor(private patientRequestRepo: PatientRequestRepository) {
    }

    static async handleLabRequest(param, patient, createdBy) {
        const {requestType, requestBody, id} = param;
        const data = {
            requestType,
            requestBody,
            patient,
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
        const {requestType, requestBody, id} = param;
        const data = {
            requestType,
            requestBody,
            patient,
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
            return {success: true, data: res};
        } catch (error) {
            return {success: false, message: error.message};
        }
    }

    static async handlePhysiotherapyRequest(param, patient, createdBy) {
        const {requestType, requestBody, id} = param;
        const data = {
            requestType,
            requestBody,
            patient,
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
            return {success: true, data: res};
        } catch (error) {
            return {success: false, message: error.message};
        }
    }

    static async handleOpthalmolgyRequest(param, patient, createdBy) {
        const {requestType, requestBody, id} = param;
        const data = {
            requestType,
            requestBody,
            patient,
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
            return {success: true, data: res};
        } catch (error) {
            return {success: false, message: error.message};
        }
    }

    static async handleDentistryRequest(param, patient, createdBy) {
        const {requestType, requestBody, id} = param;
        const data = {
            requestType,
            requestBody,
            patient,
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
            return {success: true, data: res};
        } catch (error) {
            return {success: false, message: error.message};
        }
    }

    static async handleImagingRequest(param, patient, createdBy) {
        const {requestType, requestBody, id} = param;
        const data = {
            requestType,
            requestBody,
            patient,
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
            return {success: true, data: res};
        } catch (error) {
            return {success: false, message: error.message};
        }
    }

    static async handleProcedureRequest(param, patient, createdBy) {
        const {requestType, requestBody, id} = param;
        const data = {
            requestType,
            requestBody,
            patient,
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
            return {success: true, data: res};
        } catch (error) {
            return {success: false, message: error.message};
        }
    }

    static async save(data) {
        await getConnection()
            .createQueryBuilder()
            .insert()
            .into(PatientRequest)
            .values(data)
            .execute();
    }

    static async update(data, id) {
        await getConnection()
            .createQueryBuilder()
            .update(PatientRequest)
            .set(data)
            .where('id = :id', { id })
            .execute();
    }
}
