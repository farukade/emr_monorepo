import { PatientRequestRepository } from '../../modules/patient/repositories/patient_request.repository';
import { getConnection } from 'typeorm';
import { PatientRequest } from '../../modules/patient/entities/patient_requests.entity';

export class PatientRequestHelper {
    constructor(private patientRequestRepo: PatientRequestRepository) {
    }

    static async handleLabRequest(param, patient) {
        const {requestType, requestBody, id} = param;
        const data = {
            requestType,
            requestBody,
            patient,
        };
        let res;
        try {
            if (id && id !== '') {
                res = await this.update(data, id);
            } else {
                res = await this.save(data);
            }
            return {success: true, data: res};
        } catch (error) {
            return {success: false, message: error.message};
        }
    }

    static async handlePharmacyRequest(param, patient) {
        const {requestType, requestBody, id} = param;
        const data = {
            requestType,
            requestBody,
            patient,
        };

        let res;
        try {
            if (id && id !== '') {
                res = await this.update(data, id);
            } else {
                res = await this.save(data);
            }
            return {success: true, data: res};
        } catch (error) {
            return {success: false, message: error.message};
        }
    }

    static async handlePhysiotherapyRequest(param, patient) {
        const {requestType, requestBody, id} = param;
        const data = {
            requestType,
            requestBody,
            patient,
        };

        let res;
        try {
            if (id && id !== '') {
                res = await this.update(data, id);
            } else {
                res = await this.save(data);
            }
            return {success: true, data: res};
        } catch (error) {
            return {success: false, message: error.message};
        }
    }

    static async handleOpthalmolgyRequest(param, patient) {
        const {requestType, requestBody, id} = param;
        const data = {
            requestType,
            requestBody,
            patient,
        };

        let res;
        try {
            if (id && id !== '') {
                res = await this.update(data, id);
            } else {
                res = await this.save(data);
            }
            return {success: true, data: res};
        } catch (error) {
            return {success: false, message: error.message};
        }
    }

    static async handleDentistryRequest(param, patient) {
        const {requestType, requestBody, id} = param;
        const data = {
            requestType,
            requestBody,
            patient,
        };

        let res;
        try {
            if (id && id !== '') {
                res = await this.update(data, id);
            } else {
                res = await this.save(data);
            }
            return {success: true, data: res};
        } catch (error) {
            return {success: false, message: error.message};
        }
    }

    static async handleImagingRequest(param, patient) {
        const {requestType, requestBody, id} = param;
        const data = {
            requestType,
            requestBody,
            patient,
        };

        let res;
        try {
            if (id && id !== '') {
                res = await this.update(data, id);
            } else {
                res = await this.save(data);
            }
            return {success: true, data: res};
        } catch (error) {
            return {success: false, message: error.message};
        }
    }

    static async handleProcedureRequest(param, patient) {
        const {requestType, requestBody, id} = param;
        const data = {
            requestType,
            requestBody,
            patient,
        };

        let res;
        try {
            if (id && id !== '') {
                res = await this.update(data, id);
            } else {
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
