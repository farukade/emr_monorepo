import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LeaveApplicationRepository } from './leave_application.repository';
import { StaffRepository } from '../staff/staff.repository';
import { LeaveCategoryRepository } from '../../settings/leave-category/leave.category.repository';
import { LeaveApplicationDto } from './dto/leave.application.dto';
import { LeaveApplication } from './entities/leave_application.entity';

@Injectable()
export class LeavemgtService {
    constructor(
        @InjectRepository(LeaveApplicationRepository)
        private leaveRepository: LeaveApplicationRepository,
        @InjectRepository(StaffRepository)
        private staffRepository: StaffRepository,
        @InjectRepository(LeaveCategoryRepository)
        private leaveCategoryRepository: LeaveCategoryRepository,
    ) {}

    async listApplications(): Promise<LeaveApplication[]> {
        const applications = await this.leaveRepository.find({relations: ['staff', 'category']});
        return applications;
    }

    async saveLeaveApplication(leaveApplicationDto: LeaveApplicationDto): Promise<LeaveApplication> {
        // find staff
        const staff = await this.staffRepository.findOne(leaveApplicationDto.staff_id);
        // find leave category
        const category = await this.leaveCategoryRepository.findOne(leaveApplicationDto.leave_category_id);

        const leaveData = {
            staff,
            category,
            start_date: leaveApplicationDto.start_date,
            end_date: leaveApplicationDto.end_date,
            application: leaveApplicationDto.application,
            appliedBy: null,
        };

        if (leaveApplicationDto.appliedBy) {
            const appliedBy = await this.staffRepository.findOne(leaveApplicationDto.appliedBy);
            leaveData.appliedBy = appliedBy;
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

    async deleteApplication(id: string) {
        const result = await this.leaveRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Leave application with '${id}' does not exist`);
        }
    }
}
