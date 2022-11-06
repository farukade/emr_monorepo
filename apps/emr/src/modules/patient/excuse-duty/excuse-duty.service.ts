import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { ExcuseDutyRepository } from './excuse-duty.repository';
import { ExcuseDutyDto } from './dto/excuse-duty.dto';
import { PatientExcuseDuty } from '../entities/patient_excuse_duty.entity';
import { PatientRepository } from '../repositories/patient.repository';
import { PatientNote } from '../entities/patient_note.entity';
import { AdmissionsRepository } from '../admissions/repositories/admissions.repository';
import { NicuRepository } from '../nicu/nicu.repository';
import { PatientNoteRepository } from '../repositories/patient_note.repository';
import { getStaff } from '../../../common/utils/utils';

@Injectable()
export class ExcuseDutyService {
  constructor(
    @InjectRepository(ExcuseDutyRepository)
    private excuseDutyRepository: ExcuseDutyRepository,
    @InjectRepository(PatientRepository)
    private patientRepository: PatientRepository,
    @InjectRepository(AdmissionsRepository)
    private admissionRepository: AdmissionsRepository,
    @InjectRepository(NicuRepository)
    private nicuRepository: NicuRepository,
    @InjectRepository(PatientNoteRepository)
    private patientNoteRepository: PatientNoteRepository,
  ) {}

  async getExcuseDuties(options: PaginationOptionsInterface, urlParams): Promise<Pagination> {
    const { patient_id } = urlParams;

    const page = options.page - 1;

    const query = this.excuseDutyRepository
      .createQueryBuilder('c')
      .select('c.*')
      .where('c.patient_id = :patient_id', { patient_id });

    const duties = await query
      .offset(page * options.limit)
      .limit(options.limit)
      .orderBy('c.createdAt', 'DESC')
      .getRawMany();

    const total = await query.getCount();

    let result = [];
    for (const item of duties) {
      item.patient = await this.patientRepository.findOne({
        where: { id: item.patient_id },
        relations: ['nextOfKin', 'immunization', 'hmo'],
      });

      const diagnosis = await this.patientNoteRepository.find({ where: { excuseDuty: item } });

      const staff = await getStaff(item.createdBy);

      result = [...result, { ...item, diagnosis, staff }];
    }

    return {
      result,
      lastPage: Math.ceil(total / options.limit),
      itemsPerPage: options.limit,
      totalPages: total,
      currentPage: options.page,
    };
  }

  async saveExcuseDuty(param: ExcuseDutyDto, username: string): Promise<any> {
    try {
      const { patient_id, comment, start_date, end_date, diagnoses } = param;

      const patient = await this.patientRepository.findOne(patient_id);

      const excuseDuty = new PatientExcuseDuty();
      excuseDuty.patient = patient;
      excuseDuty.comment = comment;
      excuseDuty.start_date = start_date;
      excuseDuty.end_date = end_date;
      excuseDuty.createdBy = username;
      const rs = await excuseDuty.save();

      const admission = await this.admissionRepository.findOne({ where: { patient, status: 0 } });

      const nicu = await this.nicuRepository.findOne({ where: { patient, status: 0 } });

      for (const item of diagnoses) {
        const patientDiagnosis = new PatientNote();
        patientDiagnosis.diagnosis = item;
        patientDiagnosis.status = 'Active';
        patientDiagnosis.patient = patient;
        patientDiagnosis.admission = admission;
        patientDiagnosis.nicu = nicu;
        patientDiagnosis.diagnosis_type = 'Query';
        patientDiagnosis.type = 'diagnosis';
        patientDiagnosis.createdBy = username;
        patientDiagnosis.excuseDuty = rs;
        await patientDiagnosis.save();
      }

      const diagnosis = await this.patientNoteRepository.find({ where: { excuseDuty: rs } });

      const staff = await getStaff(username);

      return { success: true, excuseDuty: { ...rs, diagnosis, staff } };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async updateExcuseDuty(id: number, excuseDutyDto: ExcuseDutyDto, createdBy) {
    return null;
  }

  async deleteExcuseDuty(id: number, username): Promise<PatientExcuseDuty> {
    return null;
  }
}
