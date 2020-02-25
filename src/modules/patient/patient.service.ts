import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PatientRepository } from './repositories/patient.repository';
import { PatientNOKRepository } from './repositories/patient.nok.repository';
import { Patient } from './patient.entity';
import { PatientDto } from './dto/patient.dto';
import { Like } from 'typeorm';

@Injectable()
export class PatientService {
    constructor(
        @InjectRepository(PatientRepository)
        private patientRepository: PatientRepository,
        @InjectRepository(PatientNOKRepository)
        private patientNOKRepository: PatientNOKRepository,
    ) {}

    async listAllPatients(): Promise<Patient[]> {
        const found = this.patientRepository.find();

        return found;
    }

    async findPatient(param: string): Promise<Patient[]> {
        const found = this.patientRepository.find({where: [
            {surname: Like(`%${param}%`)},
            {other_names: Like(`%${param}%`)},
            {fileNumber: Like(`%${param}%`)},
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
            patient.surname             = patientDto.surname;
            patient.other_names         = patientDto.other_names;
            patient.address             = patientDto.address;
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
}
