import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PatientRepository } from './repositories/patient.repository';
import { PatientNOKRepository } from './repositories/patient.nok.repository';
import { Patient } from './patient.entity';
import { PatientDto } from './dto/patient.dto';

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

    async saveNewPatient(patientDto: PatientDto): Promise<Patient> {
        const nok = await this.patientRepository.saveNOK(patientDto);

        const staff = await this.patientRepository.savePatient(patientDto);
    }
}
