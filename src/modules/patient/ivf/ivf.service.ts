import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IvfEnrollmentRepository } from './ivf_enrollment.repository';
import { IvfEnrollementDto } from './dto/ivf_enrollment.dto';
import { StaffRepository } from '../../hr/staff/staff.repository';
import { PatientRepository } from '../repositories/patient.repository';
import { IvfEnrollment } from './ivf_enrollment.entity';

@Injectable()
export class IvfService {
    constructor(
        @InjectRepository(IvfEnrollmentRepository)
        private ivfEnrollmentRepo: IvfEnrollmentRepository,
        @InjectRepository(StaffRepository)
        private staffRepository: StaffRepository,
        @InjectRepository(PatientRepository)
        private patientRepository: PatientRepository,
    ) {}

    async saveEnrollment(ivfEnrollmentDto: IvfEnrollementDto, userId): Promise<any> {
        const { wife_id, husband_id } = ivfEnrollmentDto;
        // find user
        const user  = await this.staffRepository.findOne(userId);
        try {
            // wife patient details
            ivfEnrollmentDto.wife = await this.patientRepository.findOne(wife_id);
            // husband patient details
            ivfEnrollmentDto.husband = await this.patientRepository.findOne(husband_id);
            // save enrollment details
            const data = await this.ivfEnrollmentRepo.save(ivfEnrollmentDto);
            return {success: true, data};
        } catch (err) {
            return {success: false, message: err.message};
        }
    }

    async getHistory(patientId): Promise<IvfEnrollment[]> {
        // get patient details
        const patient = await this.patientRepository.findOne(patientId);

        if (patient.gender === 'Female') {
            return await this.ivfEnrollmentRepo.find({where: {wife: patient}, relations: ['wife']});
        }  else {
            return await this.ivfEnrollmentRepo.find({where: {husband: patient}, relations: ['husband']});
        }
    }

    async getEnrollments({page}) {
        const limit = 30;
        const results = await this.ivfEnrollmentRepo.find({ relations: ['wife', 'husband'], take: limit, skip: (page * limit) - limit});
        return results;
    }

}
