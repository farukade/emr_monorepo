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
        @InjectRepository(ServiceRepository)
        private serviceRepository: ServiceRepository,
    ) {}

    async listAllPatients(): Promise<Patient[]> {
        const found = this.patientRepository.find();

        return found;
    }

    async findPatient(param: string): Promise<Patient[]> {
        const found = this.patientRepository.find({where: [
            {surname: Like(`%${param.toLocaleLowerCase()}%`)},
            {other_names: Like(`%${param.toLocaleLowerCase()}%`)},
            {fileNumber: Like(`%${param.toLocaleLowerCase()}%`)},
        ]});

        return found;
    }

    async saveNewPatient(patientDto: PatientDto): Promise<any> {
        try {
            const nok = await this.patientNOKRepository.saveNOK(patientDto);

            const patient = await this.patientRepository.savePatient(patientDto, nok);

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
            const data = {
                readingType,
                reading,
                patient,
            };
            const readings = await this.patientVitalRepository.save(data);
            return {success: true, readings };
        } catch (error) {
            return {success: false, message: error.message };
        }
    }

    async getVitals(id): Promise<PatientVital[]> {
        const patient = await this.patientRepository.findOne(id);

        const vitals = await this.patientVitalRepository.find({where: {patient}});

        return vitals;
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

    async getAntenatals(id): Promise<PatientAntenatal[]> {
        const patient = await this.patientRepository.findOne(id);

        const antenatals = await this.patientAntenatalRepository.find({where: {patient}});

        return antenatals;
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

    async getAllergies(id): Promise<PatientAllergy[]> {
        const patient = await this.patientRepository.findOne(id);

        const allergies = await this.patientAllergyRepository.find({where: {patient}});

        return allergies;
    }
}
