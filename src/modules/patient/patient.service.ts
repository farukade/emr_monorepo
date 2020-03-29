import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PatientRepository } from './repositories/patient.repository';
import { PatientNOKRepository } from './repositories/patient.nok.repository';
import { Patient } from './entities/patient.entity';
import { PatientDto } from './dto/patient.dto';
import { Like } from 'typeorm';
import { ServiceRepository } from '../settings/services/service.repository';
import { PatientVitalRepository } from './repositories/patient_vitals.repository';
import { PatientAntenatalRepository } from './repositories/patient_antenatal.repository';
import { PatientAllergyRepository } from './repositories/patient_allergy.repository';
import { PatientAntenatalDto } from './dto/patient.antenatal.dto';
import { PatientAllergyDto } from './dto/patient.allergy.dto';
import { PatientVital } from './entities/patient_vitals.entity';
import { PatientAntenatal } from './entities/patient_antenatal.entity';
import { PatientAllergy } from './entities/patient_allergies.entity';
import { PatientRequestHelper } from '../../common/utils/PatientRequestHelper';
import { PatientRequestRepository } from './repositories/patient_request.repository';
import { PatientRequest } from './entities/patient_requests.entity';
import * as moment from 'moment';
import { HmoRepository } from '../hmo/hmo.repository';
import { VoucherRepository } from '../finance/vouchers/voucher.repository';
import { Voucher } from '../finance/vouchers/voucher.entity';

@Injectable()
export class PatientService {
    constructor(
        @InjectRepository(PatientRepository)
        private patientRepository: PatientRepository,
        @InjectRepository(PatientNOKRepository)
        private patientNOKRepository: PatientNOKRepository,
        @InjectRepository(PatientVitalRepository)
        private patientVitalRepository: PatientVitalRepository,
        @InjectRepository(PatientAntenatalRepository)
        private patientAntenatalRepository: PatientAntenatalRepository,
        @InjectRepository(PatientAllergyRepository)
        private patientAllergyRepository: PatientAllergyRepository,
        @InjectRepository(PatientRequestRepository)
        private patientRequestRepository: PatientRequestRepository,
        @InjectRepository(ServiceRepository)
        private serviceRepository: ServiceRepository,
        @InjectRepository(HmoRepository)
        private hmoRepository: HmoRepository,
        @InjectRepository(VoucherRepository)
        private voucherRepository: VoucherRepository,
    ) {}

    async listAllPatients(): Promise<Patient[]> {
        const found = this.patientRepository.find();

        return found;
    }

    async findPatient(param: string): Promise<Patient[]> {
        const found = this.patientRepository.find({where: [
            {surname: Like(`%${param.toLocaleLowerCase()}%`)},
            {other_names: Like(`%${param.toLocaleLowerCase()}%`)},
            {fileNumber: Like(`%${param}%`)},
        ], relations: ['nextOfKin']});

        return found;
    }

    async saveNewPatient(patientDto: PatientDto): Promise<any> {
        try {
            const {hmoId} = patientDto;
            let hmo;
            if (hmoId && hmoId !== '') {
                hmo = await this.hmoRepository.findOne(hmoId);
            }
            const nok = await this.patientNOKRepository.saveNOK(patientDto);

            const patient = await this.patientRepository.savePatient(patientDto, nok, hmo);

            return {success: true, patient};
        } catch (err) {
            return {success: false, message: err.message};
        }
    }

    async updatePatientRecord(id: string, patientDto: PatientDto): Promise<any> {
        try {
            const patient = await this.patientRepository.findOne(id, {relations: ['nextOfKin']});
            patient.surname             = patientDto.surname.toLocaleLowerCase();
            patient.other_names         = patientDto.other_names.toLocaleLowerCase();
            patient.address             = patientDto.address.toLocaleLowerCase();
            patient.date_of_birth       = patientDto.date_of_birth;
            patient.occupation          = patientDto.occupation;
            patient.gender              = patientDto.gender;
            patient.email               = patientDto.email;
            patient.phoneNumber         = patientDto.phoneNumber;
            patient.maritalStatus       = patientDto.maritalStatus;
            patient.ethnicity           = patientDto.ethnicity;
            patient.referredBy          = patientDto.referredBy;
            patient.insurranceStatus    = patientDto.insurranceStatus;
            patient.nextOfKin.surname   = patientDto.nok_surname;
            patient.nextOfKin.other_names         = patientDto.nok_other_names;
            patient.nextOfKin.address             = patientDto.nok_address;
            patient.nextOfKin.date_of_birth       = patientDto.nok_date_of_birth;
            patient.nextOfKin.occupation          = patientDto.nok_occupation;
            patient.nextOfKin.gender              = patientDto.nok_gender;
            patient.nextOfKin.email               = patientDto.nok_email;
            patient.nextOfKin.phoneNumber         = patientDto.nok_phoneNumber;
            patient.nextOfKin.maritalStatus       = patientDto.nok_maritalStatus;
            patient.nextOfKin.ethnicity           = patientDto.nok_ethnicity;
            if (patientDto.hmoId && patientDto.hmoId !== '') {
                const hmo = await this.hmoRepository.findOne(patientDto.hmoId);
                patient.hmo = hmo;
            }
            patient.save();

            return {success: true, patient};
        } catch (err) {
            return {success: false, message: err.message};
        }
    }

    async deletePatient(id: string) {
        const result = await this.patientRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Patient with ID '${id}' not found`);
        }
    }

    async checkPaymentStatus(param) {
        const  {service_id, patient_id} = param;
        // find patient record
        const patient = this.patientRepository.findOne(patient_id);
    }

    async doSaveVitals(param): Promise<any> {
        const { patient_id, readingType, reading } = param;
        try {
            const patient = await this.patientRepository.findOne(patient_id);
            if (patient) {
                const data = {
                    readingType,
                    reading,
                    patient,
                };
                const readings = await this.patientVitalRepository.save(data);
                return {success: true, readings };
            } else {
                return {success: false, message: 'Patient record was not found'};
            }
        } catch (error) {
            return {success: false, message: error.message };
        }
    }

    async doUpdateVital(vitalId, param): Promise<any> {
        try {
            const vital = await this.patientVitalRepository.findOne(vitalId);
            vital.reading = param.reading;
            vital.readingType = param.readingType;
            await vital.save();

            return {success: true, vital };
        } catch (error) {
            return {success: false, message: error.message };
        }
    }

    async getVouchers(id, urlParams): Promise<Voucher[]> {
        const {startDate, endDate, status} = urlParams;

        const query = this.voucherRepository.createQueryBuilder('v')
                        .where('v.patient_id = :id', {id});
        if (startDate && startDate !== '') {
            const start = moment(startDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt >= '${start}'`);
        }
        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt <= '${end}'`);
        }
        if (status && status !== '') {
            let stat;
            if (status === 'active') {
                stat = true;
            } else {
                stat = false;
            }
            query.andWhere('q.isActive = :status', {status: stat});
        }
        const vouchers = query.getMany();

        return vouchers;
    }

    async getVitals(id, urlParams): Promise<PatientVital[]> {
        const {startDate, endDate} = urlParams;

        const query = this.patientVitalRepository.createQueryBuilder('q')
                        .innerJoin(Patient, 'patient', 'q.patient_id = patient.id')
                        .where('q.patient_id = :id', {id});
        if (startDate && startDate !== '') {
            const start = moment(startDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt >= '${start}'`);
        }
        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt <= '${end}'`);
        }
        const vitals = query.getMany();

        return vitals;
    }

    async deleteVital(id: string) {
        const result = await this.patientVitalRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Patient vital with ID '${id}' not found`);
        }
        return {success: true};
    }

    async doSaveAntenatal(param: PatientAntenatalDto): Promise<any> {
        const { patient_id } = param;
        try {
            const patient = await this.patientRepository.findOne(patient_id);
            param.patient = patient;
            const antenatal = await this.patientAntenatalRepository.save(param);
            return {success: true, antenatal };
        } catch (error) {
            return {success: false, message: error.message };
        }
    }

    async getAntenatals(id, urlParams): Promise<PatientAntenatal[]> {
        const {startDate, endDate} = urlParams;

        const query = this.patientAntenatalRepository.createQueryBuilder('q')
                        .innerJoin(Patient, 'patient', 'q.patient_id = patient.id')
                        .where('q.patient_id = :id', {id});
        if (startDate && startDate !== '') {
            const start = moment(startDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt >= '${start}'`);
        }
        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt <= '${end}'`);
        }
        const antenatals = query.getMany();

        return antenatals;
    }

    async doUpdateAntenatal(antenatalId, param: PatientAntenatalDto): Promise<any> {
        try {
            const antenatal = await this.patientAntenatalRepository.findOne(antenatalId);
            antenatal.fetalHeartRate = param.fetalHeartRate;
            antenatal.fetalLie = param.fetalLie;
            antenatal.positionOfFetus = param.positionOfFetus;
            antenatal.heightOfFunds = param.heightOfFunds;
            antenatal.relationshipToBrim = param.relationshipToBrim;
            await antenatal.save();

            return {success: true, antenatal };
        } catch (error) {
            return {success: false, message: error.message };
        }
    }

    async deleteAntenatal(id: string) {
        const result = await this.patientAntenatalRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Patient antenatal with ID '${id}' not found`);
        }
        return {success: true};
    }

    async doSaveAllergies(param: PatientAllergyDto): Promise<any> {
        const { patient_id } = param;
        try {
            const patient = await this.patientRepository.findOne(patient_id);
            param.patient = patient;
            const allergy = await this.patientAllergyRepository.save(param);
            return {success: true, allergy };
        } catch (error) {
            return {success: false, message: error.message };
        }
    }

    async doUpdateAllergy(allergyId, param: PatientAllergyDto): Promise<any> {
        try {
            const allergy = await this.patientAllergyRepository.findOne(allergyId);
            allergy.category = param.category;
            allergy.allergy = param.allergy;
            allergy.severity = param.severity;
            allergy.reaction = param.reaction;
            allergy.save();

            return {success: true, allergy };

        } catch (error) {
            return {success: false, message: error.message };
        }
    }

    async getAllergies(id, urlParams): Promise<PatientAllergy[]> {
        const {startDate, endDate} = urlParams;

        const query = this.patientAllergyRepository.createQueryBuilder('q')
                        .innerJoin(Patient, 'patient', 'q.patient_id = patient.id')
                        .where('q.patient_id = :id', {id});
        if (startDate && startDate !== '') {
            const start = moment(startDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt >= '${start}'`);
        }
        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt <= '${end}'`);
        }
        const allergies = query.getMany();

        return allergies;
    }

    async deleteAllergy(id: string) {
        const result = await this.patientAllergyRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Patient allergy with ID '${id}' not found`);
        }
        return {success: true};
    }

    async doSaveRequest(param) {
        const { requestType, patient_id } = param;
        if (!requestType && requestType === '' ) {
            return {success: false, message: 'Request Type cannot be empty'};
        }
        let res;
        const patient = await this.patientRepository.findOne(patient_id);
        switch (requestType) {
            case 'lab':
                res = await PatientRequestHelper.handleLabRequest(param, patient);
                break;
            case 'pharmacy':
                res = await PatientRequestHelper.handlePharmacyRequest(param, patient);
                break;
            case 'physiotherapy':
                res = await PatientRequestHelper.handlePhysiotherapyRequest(param, patient);
                break;
            case 'opthalmology':
                res = await PatientRequestHelper.handleOpthalmolgyRequest(param, patient);
                break;
            case 'dentistry':
                res = await PatientRequestHelper.handleDentistryRequest(param, patient);
                break;
            case 'imaging':
                res = await PatientRequestHelper.handleImagingRequest(param, patient);
                break;
            case 'procedure':
                res = await PatientRequestHelper.handleProcedureRequest(param, patient);
                break;
            default:
                res = {success: false, message: 'No data'};
                break;
        }
        return res;
    }

    async doListRequest(requestType, patient_id, urlParams): Promise<PatientRequest[]> {
        const {startDate, endDate} = urlParams;

        const query = this.patientRequestRepository.createQueryBuilder('q')
                        .innerJoin(Patient, 'patient', 'q.patient_id = patient.id')
                        .where('q.patient_id = :patient_id', {patient_id})
                        .andWhere('q.requestType = :requestType', {requestType});

        if (startDate && startDate !== '') {
            const start = moment(startDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt >= '${start}'`);
        }
        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt <= '${end}'`);
        }
        const allergies = query.getMany();

        return allergies;
    }

    async deleteRequest(id: string) {
        const result = await this.patientRequestRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Patient request with ID '${id}' not found`);
        }
        return {success: true};
    }
}
