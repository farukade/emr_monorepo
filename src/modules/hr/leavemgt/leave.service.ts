import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StaffRepository } from '../staff/staff.repository';
import { LeaveCategoryRepository } from '../../settings/leave-category/leave.category.repository';
import { LeaveDto } from './dto/leave.dto';
import { Leave } from './entities/leave.entity';
import { DiagnosisRepository } from '../../settings/diagnosis/diagnosis.repository';
import { LeaveRepository } from './repositories/leave.repository';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { Pagination } from '../../../common/paginate/paginate.interface';
import * as moment from 'moment';

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(LeaveRepository)
    private leaveRepository: LeaveRepository,
    @InjectRepository(StaffRepository)
    private staffRepository: StaffRepository,
    @InjectRepository(LeaveCategoryRepository)
    private leaveCategoryRepository: LeaveCategoryRepository,
    @InjectRepository(DiagnosisRepository)
    private diagnosisRepository: DiagnosisRepository,
  ) {}

  async listApplications(options: PaginationOptionsInterface, params): Promise<Pagination> {
    const { type, staff_id, applied_by, category_id, status } = params;

    const query = this.leaveRepository.createQueryBuilder('l').select('l.*');

    const page = options.page - 1;

    if (type && type !== '') {
      query.andWhere('l.leave_type = :type', { type });
    }

    if (staff_id && staff_id !== '') {
      query.andWhere('l.staff_id = :id', { id: staff_id });
    }

    if (applied_by && applied_by !== '') {
      query.andWhere('l.applied_by = :id', { id: applied_by });
    }

    if (category_id && category_id !== '') {
      query.andWhere('l.leave_category_id = :id', { id: category_id });
    }

    if (status && status !== '') {
      query.andWhere('l.status = :status', { status });
    }

    const leaves = await query
      .offset(page * options.limit)
      .limit(options.limit)
      .orderBy('l.createdAt', 'DESC')
      .getRawMany();

    const total = await query.getCount();

    let result = [];
    for (const item of leaves) {
      if (item.staff_id) {
        item.staff = await this.staffRepository.findOne(item.staff_id);
      }

      if (item.leave_category_id) {
        item.category = await this.leaveCategoryRepository.findOne(item.leave_category_id);
      }

      result = [...result, item];
    }

    return {
      result,
      lastPage: Math.ceil(total / options.limit),
      itemsPerPage: options.limit,
      totalPages: total,
      currentPage: options.page,
    };
  }

  async requestLeave(leaveDto: LeaveDto, username: string): Promise<any> {
    const { staff_id, leave_category_id, start_date, end_date, reason, type, applied_by, diagnosis_id } = leaveDto;

    // find staff
    const staff = await this.staffRepository.findOne(staff_id);
    if (!staff) {
      return { success: false, message: 'Staff not found' };
    }

    // find leave category
    const category = await this.leaveCategoryRepository.findOne(leave_category_id);
    if (!category) {
      return { success: false, message: 'Invalid category selected or category does not exist' };
    }

    const leave = new Leave();
    leave.staff = staff;
    leave.category = category;
    leave.start_date = start_date;
    leave.end_date = end_date;
    leave.application = reason;
    leave.leave_type = type;

    if (applied_by) {
      const doctor = await this.staffRepository.findOne(applied_by);
      if (!doctor) {
        return { success: false, message: 'staff not found' };
      }

      leave.appliedBy = doctor;
    }

    if (diagnosis_id) {
      leave.diagnosis = await this.diagnosisRepository.findOne(diagnosis_id);
    }

    leave.createdBy = username;

    return await leave.save();
  }

  async updateLeaveApplication(id: string, leaveDto: LeaveDto, username: string): Promise<Leave> {
    const { staff_id, leave_category_id, start_date, end_date, reason, applied_by, diagnosis_id } = leaveDto;

    // find staff
    const staff = await this.staffRepository.findOne(staff_id);

    // find leave category
    const category = await this.leaveCategoryRepository.findOne(leave_category_id);

    const leaveData = await this.leaveRepository.findOne(id);
    leaveData.staff = staff;
    leaveData.category = category;
    leaveData.start_date = start_date;
    leaveData.end_date = end_date;
    leaveData.application = reason;

    if (applied_by) {
      leaveData.appliedBy = await this.staffRepository.findOne(applied_by);
    }

    if (diagnosis_id) {
      leaveData.diagnosis = await this.diagnosisRepository.findOne(diagnosis_id);
    }

    leaveData.lastChangedBy = username;

    return await leaveData.save();
  }

  async approveLeave(id: string, username: string): Promise<Leave> {
    try {
      const leave = await this.leaveRepository.findOne(id);

      leave.status = 1;
      leave.approved_by = username;
      leave.approved_at = moment().format('YYYY-MM-DD HH:mm:ss');

      return await leave.save();
    } catch (e) {}
  }

  async rejectLeave(id: string, param: any, username: string): Promise<Leave> {
    try {
      const { reason } = param;

      const leave = await this.leaveRepository.findOne(id);

      leave.status = -1;
      leave.declined_by = username;
      leave.declined_at = moment().format('YYYY-MM-DD HH:mm:ss');
      leave.decline_reason = reason;

      return await leave.save();
    } catch (e) {}
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
