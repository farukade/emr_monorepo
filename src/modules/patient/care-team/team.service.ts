import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CareTeamRepository } from './team.repository';
import { PaginationOptionsInterface } from '../../../common/paginate';
import * as moment from 'moment';
import { AdmissionsRepository } from '../admissions/repositories/admissions.repository';
import { StaffRepository } from '../../hr/staff/staff.repository';
import { CareTeamDto } from './dto/team.dto';
import { CareTeam } from './entities/team.entity';
import { PatientRepository } from '../repositories/patient.repository';

@Injectable()
export class CareTeamService {
  constructor(
    @InjectRepository(CareTeamRepository)
    private careTeamRepository: CareTeamRepository,
    @InjectRepository(AdmissionsRepository)
    private admissionsRepository: AdmissionsRepository,
    @InjectRepository(StaffRepository)
    private staffRepository: StaffRepository,
    @InjectRepository(PatientRepository)
    private patientRepository: PatientRepository,
  ) {}

  async getMembers(options: PaginationOptionsInterface, params): Promise<any> {
    const { startDate, endDate, patient_id, type, id } = params;
    const query = this.careTeamRepository.createQueryBuilder('q').select('q.*');

    if (startDate && startDate !== '') {
      const start = moment(startDate).endOf('day').toISOString();
      query.andWhere(`q.createdAt >= '${start}'`);
    }

    if (endDate && endDate !== '') {
      const end = moment(endDate).endOf('day').toISOString();
      query.andWhere(`q.createdAt <= '${end}'`);
    }

    if (patient_id && patient_id !== '') {
      query.andWhere('q.patient = :patient_id', { patient_id });
    }

    if (type && type !== '') {
      query.andWhere('q.type = :type', { type });
    }

    if (id && id !== '') {
      query.andWhere('q.item_id = :id', { id });
    }

    const page = options.page - 1;

    const list = await query
      .offset(page * options.limit)
      .limit(options.limit)
      .orderBy('q.is_primary_care_giver', 'ASC')
      .orderBy('q.createdAt', 'DESC')
      .getRawMany();

    const total = await query.getCount();

    let primaryCareGiver;

    let result = [];
    for (const item of list) {
      if (item.type === 'admission') {
        item.admission = await this.admissionsRepository.findOne(item.admission_id);
      }

      const staff = await this.staffRepository.findOne(item.care_giver_id);

      item.member = staff;

      if (item.is_primary_care_giver) {
        primaryCareGiver = staff;
      }

      result = [...result, item];
    }

    return {
      result,
      lastPage: Math.ceil(total / options.limit),
      itemsPerPage: options.limit,
      totalPages: total,
      currentPage: options.page,
      primaryCareGiver,
    };
  }

  async saveTeamMembers(careTeamDto: CareTeamDto, username): Promise<any> {
    try {
      const { item_id, type, staffs, patient_id, primary_care_id } = careTeamDto;

      const patient = await this.patientRepository.findOne(patient_id);

      await this.careTeamRepository.softDelete({ type, item_id });

      let results = [];
      for (const item of staffs) {
        const staff = await this.staffRepository.findOne(item.id);

        const member = new CareTeam();
        member.member = staff;
        member.is_primary_care_giver = staff.id === primary_care_id;
        member.type = type;
        member.item_id = item_id;
        member.patient = patient;
        member.createdBy = username;

        const rs = await member.save();

        results = [...results, rs];
      }

      return { success: true, members: results };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }
}
