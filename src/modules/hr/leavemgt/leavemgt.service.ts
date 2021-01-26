import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LeaveApplicationRepository } from './leave_application.repository';
import { StaffRepository } from '../staff/staff.repository';
import { LeaveCategoryRepository } from '../../settings/leave-category/leave.category.repository';
import { LeaveApplicationDto } from './dto/leave.application.dto';
import { LeaveApplication } from './entities/leave_application.entity';
import { DiagnosisRepository } from '../../settings/diagnosis/diagnosis.repository';

@Injectable()
export class LeavemgtService {
    private limit = 20;
    constructor(
        @InjectRepository(LeaveApplicationRepository)
        private leaveRepository: LeaveApplicationRepository,
        @InjectRepository(StaffRepository)
        private staffRepository: StaffRepository,
        @InjectRepository(LeaveCategoryRepository)
        private leaveCategoryRepository: LeaveCategoryRepository,
        @InjectRepository(DiagnosisRepository)
        private diagnosisRepository: DiagnosisRepository,
    ) {}

    async listApplications(urlParams): Promise<LeaveApplication[]> {
        const {page} = urlParams;
        const applications = await this.leaveRepository.find({
            relations: ['staff', 'category'],
            skip: (page * this.limit) - this.limit,
            take: this.limit,
        });
        return applications;
    }

    async listExcuseDuty(urlParams): Promise<LeaveApplication[]> {
        const {page} = urlParams;
        const applications = await this.leaveRepository.find({where: {
                                leaveType: 'excuse_duty',
                            },
                            relations: ['staff', 'category', 'appliedBy', 'diagnosis'],
                            skip: (page * this.limit) - this.limit,
                            take: this.limit,
                        });
        return applications;
    }

    async saveLeaveApplication(leaveApplicationDto: LeaveApplicationDto): Promise<any> {
        // find staff
        const staff = await this.staffRepository.findOne(leaveApplicationDto.staff_id);
        if (!staff) return {success: false, message: 'Staff not found'};
        // find leave category
        const category = await this.leaveCategoryRepository.findOne(leaveApplicationDto.leave_category_id);
        if (!category) return {success: false, message: 'Invalid category selected or category does not exist'};
        
        const leaveData = {
            staff,
            category,
            start_date: leaveApplicationDto.start_date,
            end_date: leaveApplicationDto.end_date,
            application: leaveApplicationDto.application,
            appliedBy: null,
            diagnosis: null,
            leaveType: 'leave',
        };

        if (leaveApplicationDto.appliedBy) {
            const appliedBy = await this.staffRepository.findOne(leaveApplicationDto.appliedBy);
            if (!appliedBy) return {success: false, message: 'please make sure a valid user is submitting this request'};            
            leaveData.appliedBy = appliedBy;
            leaveData.leaveType = 'excuse_duty';
        }

        if (leaveApplicationDto.diagnosis_id) {
            const diagnosis = await this.diagnosisRepository.findOne(leaveApplicationDto.diagnosis_id);
            leaveData.diagnosis = diagnosis;
        }

        const data = await this.leaveRepository.save(leaveData);

        return data;
    }

    async updateLeaveApplication(id: string, leaveApplicationDto: LeaveApplicationDto): Promise<LeaveApplication> {
        // find staff
        const staff = await this.staffRepository.findOne(leaveApplicationDto.staff_id);
        // find leave category
        const category = await this.leaveCategoryRepository.findOne(leaveApplicationDto.leave_category_id);

        const leaveData = await this.leaveRepository.findOne(id);
        leaveData.staff = staff;
        leaveData.category = category;
        leaveData.start_date = leaveApplicationDto.start_date;
        leaveData.end_date = leaveApplicationDto.end_date;
        leaveData.application = leaveApplicationDto.application;
        if (leaveApplicationDto.appliedBy) {
            leaveData.appliedBy = await this.staffRepository.findOne(leaveApplicationDto.appliedBy);
        }
        if (leaveApplicationDto.diagnosis_id) {
            const diagnosis = await this.diagnosisRepository.findOne(leaveApplicationDto.diagnosis_id);
            leaveData.diagnosis = diagnosis;
        }

        await leaveData.save();
        return leaveData;
    }

    async approveLeave(id: string): Promise<LeaveApplication> {
        const leave = await this.leaveRepository.findOne(id);

        leave.status = 1;
        await leave.save();

        return leave;
    }

    async rejectLeave(id: string): Promise<LeaveApplication> {
        const leave = await this.leaveRepository.findOne(id);

        leave.status = 2;
        await leave.save();

        return leave;
    }

    async deleteApplication(id: number, username) {
        const leave = await this.leaveRepository.findOne(id);

        if (!leave) {
            throw new NotFoundException(`Leave application with '${id}' does not exist`);
        }

        leave.deletedBy = username;
        await leave.save();

        return leave.softRemove();
    }
}
