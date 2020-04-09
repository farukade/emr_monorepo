import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EnrollmentRepository } from './enrollment.repository';
import { EnrollmentDto } from './dto/enrollment.dto';
import { PatientRepository } from '../repositories/patient.repository';

@Injectable()
export class AntenatalService {
    constructor(
        @InjectRepository(EnrollmentRepository)
        private enrollmentRepository: EnrollmentRepository,
        @InjectRepository(PatientRepository)
        private patientRepository: PatientRepository,
    ) {

    }

    async saveEnrollment(createDto: EnrollmentDto, createdBy) {
        // find patient
        const patient = await this.patientRepository.findOne(createDto.patient_id);
        try {
            createDto.patient = patient;
            createDto.createdBy = createdBy;
            const enrollment = await this.enrollmentRepository.save(createDto);
            return {success: true, enrollment};
        } catch (error) {
            return {success: false, message: error.message};
        }
    }
}
