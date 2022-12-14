import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdmissionsRepository } from './repositories/admissions.repository';
import { AdmissionClinicalTaskRepository } from './repositories/admission-clinical-tasks.repository';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { StaffRepository } from '../../hr/staff/staff.repository';
import { PatientRepository } from '../repositories/patient.repository';
import { RoomRepository } from '../../settings/room/room.repository';
import { AdmissionClinicalTask } from './entities/admission-clinical-task.entity';
import * as moment from 'moment';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { PatientVitalRepository } from '../repositories/patient_vitals.repository';
import { PatientRequestHelper } from '../../../common/utils/PatientRequestHelper';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { NicuRepository } from '../nicu/nicu.repository';
import { AuthRepository } from '../../auth/auth.repository';
import { SoapDto } from './dto/soap.dto';
import { PatientNoteRepository } from '../repositories/patient_note.repository';
import { PatientNote } from '../entities/patient_note.entity';
import { getStaff, postDebit } from '../../../common/utils/utils';
import { ServiceCostRepository } from '../../settings/services/repositories/service_cost.repository';
import { NicuAccommodationRepository } from '../../settings/nicu-accommodation/accommodation.repository';
import { TransactionCreditDto } from '../../finance/transactions/dto/transaction-credit.dto';
import { Transaction } from '../../finance/transactions/entities/transaction.entity';
import { getConnection } from 'typeorm';
import { Nicu } from '../nicu/entities/nicu.entity';
import { Admission } from './entities/admission.entity';
import { LabourEnrollmentRepository } from '../labour-management/repositories/labour-enrollment.repository';
import { PatientFluidChart } from '../entities/patient_fluid_chart.entity';
import { AdmissionRoom } from './entities/admission-room.entity';
import { AdmissionRoomRepository } from './repositories/admission-room.repository';
import { PatientAlert } from '../entities/patient_alert.entity';

@Injectable()
export class AdmissionsService {
  constructor(
    @InjectRepository(AdmissionsRepository)
    private admissionRepository: AdmissionsRepository,
    @InjectRepository(AdmissionClinicalTaskRepository)
    private clinicalTaskRepository: AdmissionClinicalTaskRepository,
    @InjectRepository(AuthRepository)
    private authRepository: AuthRepository,
    @InjectRepository(PatientRepository)
    private patientRepository: PatientRepository,
    @InjectRepository(StaffRepository)
    private staffRepository: StaffRepository,
    @InjectRepository(RoomRepository)
    private roomRepository: RoomRepository,
    @InjectRepository(PatientVitalRepository)
    private patientVitalRepository: PatientVitalRepository,
    @InjectRepository(NicuRepository)
    private nicuRepository: NicuRepository,
    @InjectRepository(PatientNoteRepository)
    private patientNoteRepository: PatientNoteRepository,
    @InjectRepository(ServiceCostRepository)
    private serviceCostRepository: ServiceCostRepository,
    @InjectRepository(LabourEnrollmentRepository)
    private labourEnrollmentRepository: LabourEnrollmentRepository,
    @InjectRepository(NicuAccommodationRepository)
    private nicuAccommodationRepository: NicuAccommodationRepository,
    @InjectRepository(AdmissionRoomRepository)
    private admissionRoomRepository: AdmissionRoomRepository,
  ) {}

  async getAdmissions(options: PaginationOptionsInterface, params): Promise<Pagination> {
    const { startDate, endDate, patient_id, status } = params;

    const query = this.admissionRepository.createQueryBuilder('q').select('q.*');

    if (startDate && startDate !== '') {
      const start = moment(startDate).endOf('day').toISOString();
      query.andWhere(`q.createdAt >= '${start}'`);
    }

    if (endDate && endDate !== '') {
      const end = moment(endDate).endOf('day').toISOString();
      query.andWhere(`q.createdAt <= '${end}'`);
    }

    if (patient_id && patient_id !== '') {
      query.andWhere('q.patient_id = :patient_id', { patient_id });
    }

    if (status && status !== '') {
      query.andWhere('q.status = :status', { status });
    }

    const page = options.page - 1;

    const admissions = await query
      .offset(page * options.limit)
      .limit(options.limit)
      .orderBy('q.createdAt', 'DESC')
      .getRawMany();

    const total = await query.getCount();

    let result = [];
    for (const item of admissions) {
      if (item.patient_id) {
        const patient = await this.patientRepository.findOne(item.patient_id, {
          relations: ['nextOfKin', 'immunization', 'hmo'],
        });

        const admission = patient.admission_id ? await this.admissionRepository.findOne(patient.admission_id) : null;

        item.patient = { ...patient, admission };
      }

      if (item.room_id) {
        item.room = await this.roomRepository.findOne(item.room_id, {
          relations: ['category'],
        });
      }

      item.admitted_by = await getStaff(item.createdBy);
      item.dischargedBy = item.discharged_by ? await this.staffRepository.findOne(item.discharged_by) : null;

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

  async saveAdmission(id: string, createDto: CreateAdmissionDto, username: string): Promise<any> {
    try {
      const { health_state, reason, nicu } = createDto;

      const patient = await this.patientRepository.findOne(id, {
        relations: ['nextOfKin', 'immunization', 'hmo'],
      });

      let check: Admission | Nicu;
      if (nicu) {
        // check nicu
        check = await this.nicuRepository.findOne({ where: { patient, status: 0 } });
        if (check) {
          return { success: false, message: 'Error, patient already admitted to NICU' };
        }
      } else {
        // check admission
        check = await this.admissionRepository.findOne({ where: { patient, status: 0 } });
        if (check) {
          return { success: false, message: 'Error, patient already admitted' };
        }
      }

      let admission: Admission | Nicu;

      const data = {
        patient,
        health_state,
        reason,
        createdBy: username,
        status: 0,
      };

      if (nicu) {
        // save to nicu
        admission = await this.nicuRepository.save(data);

        patient.nicu_id = admission.id;
        await patient.save();
      } else {
        // save admission info
        admission = await this.admissionRepository.save(data);

        patient.admission_id = admission.id;
        await patient.save();
      }

      try {
        await getConnection()
          .createQueryBuilder()
          .update(Transaction)
          .set({ status: -1, is_admitted: true })
          .where('patient_id = :id', { id: patient.id })
          .andWhere('status = :status', { status: 0 })
          .execute();
      } catch (e) {}

      return { success: true, patient };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  async startDischarge(id: number, params: any, username: string): Promise<any> {
    try {
      const { note } = params;

      const admission = await this.admissionRepository.findOne(id, {
        relations: ['patient'],
      });

      if (note && note !== '') {
        const dischargeNote = new PatientNote();
        dischargeNote.description = note;
        dischargeNote.patient = admission.patient;
        dischargeNote.admission = admission;
        dischargeNote.type = 'discharge';
        dischargeNote.createdBy = username;
        await dischargeNote.save();
      }

      admission.start_discharge = true;
      admission.start_discharge_date = moment().format('YYYY-MM-DD HH:mm:ss');
      admission.start_discharge_by = username;
      const rs = await admission.save();

      return { success: true, admission: rs };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  async completeDischarge(id: number, params: any, username: string): Promise<any> {
    try {
      const { note } = params;

      const admission = await this.admissionRepository.findOne(id, {
        relations: ['room', 'patient'],
      });

      const staff = await getStaff(username);

      admission.date_discharged = moment().format('YYYY-MM-DD HH:mm:ss');
      admission.dischargedBy = staff;
      admission.status = 1;
      admission.lastChangedBy = username;
      const rs = await admission.save();

      if (note && note !== '') {
        const dischargeNote = new PatientNote();
        dischargeNote.description = note;
        dischargeNote.patient = admission.patient;
        dischargeNote.admission = admission;
        dischargeNote.type = 'discharge';
        dischargeNote.createdBy = username;
        await dischargeNote.save();
      }

      const room = await this.roomRepository.findOne(admission.room?.id);
      if (room) {
        room.status = 'Not Occupied';
        room.admission_id = null;
        await room.save();

        const admissionRoom = await this.admissionRoomRepository.findOne({
          where: { room, admission },
        });
        if (admissionRoom) {
          admissionRoom.checked_out_at = moment().format('YYYY-MM-DD HH:mm:ss');
          admissionRoom.checked_out_by = username;
          await admissionRoom.save();
        }
      }

      const patient = await this.patientRepository.findOne(admission.patient.id);
      patient.admission_id = null;
      await patient.save();

      return { success: true, admission: rs };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  async saveAssignBed(params: any, username: string) {
    try {
      const { admission_id, room_id, reassign } = params;

      // find admission
      const admission = await this.admissionRepository.findOne(admission_id, {
        relations: ['patient', 'room'],
      });

      // find patient
      const patient_id = admission.patient.id;
      const patient = await this.patientRepository.findOne(patient_id, {
        relations: ['hmo'],
      });

      // find room
      const room = await this.roomRepository.findOne(room_id, {
        relations: ['category'],
      });
      if (room.status === 'Occupied') {
        return { success: false, message: 'room is already occupied' };
      }

      if (reassign && reassign === 1) {
        if (admission.room.id === room.id) {
          return {
            success: false,
            message: 'room is already given to patient',
          };
        }

        const previousRoom = await this.roomRepository.findOne(admission.room.id);
        previousRoom.status = 'Not Occupied';
        previousRoom.admission_id = null;
        await previousRoom.save();

        const admissionRoom = await this.admissionRoomRepository.findOne({
          where: { room: previousRoom, admission },
        });
        if (admissionRoom) {
          admissionRoom.checked_out_at = moment().format('YYYY-MM-DD HH:mm:ss');
          admissionRoom.checked_out_by = username;
          await admissionRoom.save();
        }
      }

      const newAdmissionRoom = new AdmissionRoom();
      newAdmissionRoom.admission = admission;
      newAdmissionRoom.room = room;
      newAdmissionRoom.assigned_at = moment().format('YYYY-MM-DD HH:mm:ss');
      newAdmissionRoom.assigned_by = username;
      await newAdmissionRoom.save();

      // save room
      room.status = 'Occupied';
      room.admission_id = admission.id;
      await room.save();

      // update admission with room
      admission.room = room;
      admission.room_assigned_at = moment().format('YYYY-MM-DD HH:mm:ss');
      admission.room_assigned_by = username;
      const rs = await admission.save();

      // find service cost
      const hmo = patient.hmo;
      const serviceCost = await this.serviceCostRepository.findOne({
        where: { code: room.category.code, hmo },
      });

      const amount = serviceCost?.tariff || 0;

      // save transaction
      const data: TransactionCreditDto = {
        patient_id: patient.id,
        username,
        sub_total: 0,
        vat: 0,
        amount: amount * -1,
        voucher_amount: 0,
        amount_paid: 0,
        change: 0,
        description: `${room.category.name}, Room ${room.name} - Day 1`,
        payment_method: null,
        part_payment_expiry_date: null,
        bill_source: 'ward',
        next_location: null,
        status: 0,
        hmo_approval_code: null,
        transaction_details: null,
        admission_id: admission?.id || null,
        nicu_id: null,
        staff_id: null,
        lastChangedBy: null,
      };

      await postDebit(data, serviceCost, null, null, null, hmo);

      return { success: true, admission: rs };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  async getTasks(options: PaginationOptionsInterface, params: any) {
    const { patient_id, type, item_id, admission_id } = params;

    const page = options.page - 1;

    const query = this.clinicalTaskRepository.createQueryBuilder('q').select('q.*');

    if (patient_id && patient_id !== '') {
      query.andWhere('q.patient_id = :patient_id', { patient_id });
    }

    if (admission_id && admission_id !== '') {
      query.andWhere('q.admission_id = :admission_id', { admission_id });
    }

    if (type && type === 'admission') {
      query.andWhere('q.admission_id = :id', { id: item_id });
    }

    if (type && type === 'nicu') {
      query.andWhere('q.nicu_id = :id', { id: item_id });
    }

    if (type && type === 'labour') {
      query.andWhere('q.labour_id = :id', { id: item_id });
    }

    const result = await query
      .offset(page * options.limit)
      .limit(options.limit)
      .orderBy({ 'q.completed': 'ASC', 'q.nextTime': 'ASC' })
      .getRawMany();

    const total = await query.getCount();

    let results = [];
    for (const request of result) {
      const vitals = await this.patientVitalRepository.find({
        where: { task: request.id },
        order: { createdAt: 'DESC' },
      });

      let admission: Admission;
      if (request.admission_id) {
        admission = await this.admissionRepository.findOne({
          where: { id: request.admission_id },
          relations: ['room', 'room.category'],
        });
      }

      const patient = await this.patientRepository.findOne({
        where: { id: request.patient_id },
        relations: ['nextOfKin', 'immunization', 'hmo'],
      });

      const user = await this.authRepository.findOne({
        where: { username: request.createdBy },
        relations: ['details'],
      });

      const data = {
        ...request,
        staff: user,
        vitals,
        admission,
        patient,
      };
      results = [...results, data];
    }

    return {
      result: results,
      lastPage: Math.ceil(total / options.limit),
      itemsPerPage: options.limit,
      totalPages: total,
      currentPage: options.page,
    };
  }

  async deleteTask(id: number, username): Promise<any> {
    const result = await this.clinicalTaskRepository.findOne(id, {
      relations: ['admission', 'nicu'],
    });

    if (!result) {
      throw new NotFoundException(`Clinical Task with ID '${id}' not found`);
    }

    result.deletedBy = username;
    await result.save();

    const vitals = await this.patientVitalRepository.find({
      where: { task: result },
    });
    for (const item of vitals) {
      const vital = await this.patientVitalRepository.findOne(item.id, {
        relations: ['fluidChart'],
      });
      vital.deletedBy = username;
      await vital.save();

      const fluid = await getConnection().getRepository(PatientFluidChart).findOne(item.id);
      if (fluid) {
        fluid.deletedBy = username;
        await fluid.save();
        await fluid.softRemove();
      }

      await vital.softRemove();
    }

    return result.softRemove();
  }

  async saveClinicalTasks(patientId: number, params: any, username: string): Promise<any> {
    try {
      const { tasks, prescription } = params;

      const patient = await this.patientRepository.findOne(patientId);

      const admission = await this.admissionRepository.findOne({
        where: { patient, status: 0 },
      });

      const nicu = await this.nicuRepository.findOne({
        where: { patient, status: 0 },
      });

      const labour = await this.labourEnrollmentRepository.findOne({
        where: { patient, status: 0 },
      });

      let request;
      if (prescription.items && prescription.items.length > 0) {
        request = await PatientRequestHelper.handlePharmacyRequest(prescription, patient, username);
      }

      let results = [];
      for (const task of tasks) {
        const newTask = new AdmissionClinicalTask();

        if (task.title === 'Medication') {
          newTask.task = task.title;
          newTask.title = `Give ${task.dose}dose(s) of ${task.drug.name} every ${task.interval}${task.intervalType}`;
          newTask.taskType = 'regimen';
          newTask.dose = task?.dose?.toString() || '';
          newTask.drug = task.drug;
          newTask.request = request?.data && request?.data.length > 0 ? request.data[0] : null;
          newTask.frequency = task.frequency;
          newTask.taskCount = task.taskNumber;
        } else if (task.title === 'Fluid Chart') {
          newTask.task = task.name;
          newTask.title = `Check ${task.name} every ${task.interval}${task.intervalType}`;
          newTask.taskType = 'fluid';
          newTask.taskCount = task.taskCount;
        } else {
          newTask.task = task.name;
          newTask.title = `Check ${task.name} every ${task.interval}${task.intervalType}`;
          newTask.taskType = 'vitals';
          newTask.taskCount = task.taskCount;
        }

        newTask.interval = task.interval;
        newTask.intervalType = task.intervalType;
        newTask.startTime =
          task.startTime === ''
            ? moment().format('YYYY-MM-DD HH:mm:ss')
            : moment(task.startTime).format('YYYY-MM-DD HH:mm:ss');
        newTask.nextTime =
          task.startTime === ''
            ? moment().format('YYYY-MM-DD HH:mm:ss')
            : moment(task.startTime).format('YYYY-MM-DD HH:mm:ss');
        newTask.patient = patient;
        newTask.admission = admission;
        newTask.nicu = nicu;
        newTask.labour = labour;
        newTask.createdBy = username;

        const rs = await newTask.save();
        results = [...results, rs];
      }

      return { success: true, results };
    } catch (err) {
      console.log(err);
      return { success: false, message: err.message };
    }
  }

  async getWardRounds(options: PaginationOptionsInterface, params: any): Promise<any> {
    try {
      const { type, item_id } = params;

      const query = this.patientNoteRepository
        .createQueryBuilder('q')
        .select('q.*')
        .where('q.visit = :visit', { visit: 'soap' });

      if (type && type === 'admission') {
        query.andWhere('q.admission_id = :id', { id: item_id });
      }

      if (type && type === 'nicu') {
        query.andWhere('q.nicu_id = :id', { id: item_id });
      }

      const count = await query.getCount();

      query.orderBy({ 'q.createdAt': 'DESC' });

      const page = options.page - 1;

      const result = await query
        .take(options.limit)
        .skip(page * options.limit)
        .getRawMany();

      let notes = [];
      for (const item of result) {
        const staff = await getStaff(item.createdBy);

        notes = [...notes, { ...item, staff }];
      }

      return {
        result: notes,
        lastPage: Math.ceil(count / options.limit),
        itemsPerPage: options.limit,
        totalPages: count,
        currentPage: options.page,
      };
    } catch (err) {
      return {
        success: false,
        error: `${err.message || 'problem fetching soap at the moment please try again later'}`,
      };
    }
  }

  async saveSoap(param: SoapDto, createdBy: string) {
    try {
      const { patient_id, complaints, treatmentPlan, physicalExaminationSummary, item_id, type } = param;

      const admission = type === 'admission' ? await this.admissionRepository.findOne(item_id) : null;

      const nicu = type === 'nicu' ? await this.nicuRepository.findOne(item_id) : null;

      const patient = await this.patientRepository.findOne(patient_id);

      if (complaints !== '') {
        const complaint = new PatientNote();
        complaint.description = complaints;
        complaint.patient = patient;
        complaint.admission = admission;
        complaint.nicu = nicu;
        complaint.type = 'complaints';
        complaint.visit = 'soap';
        complaint.createdBy = createdBy;
        await complaint.save();
      }

      if (treatmentPlan !== '') {
        const plan = new PatientNote();
        plan.description = treatmentPlan;
        plan.patient = patient;
        plan.admission = admission;
        plan.nicu = nicu;
        plan.type = 'treatment-plan';
        plan.visit = 'soap';
        plan.createdBy = createdBy;
        await plan.save();
      }

      if (physicalExaminationSummary !== '') {
        const examination = new PatientNote();
        examination.description = physicalExaminationSummary;
        examination.patient = patient;
        examination.admission = admission;
        examination.nicu = nicu;
        examination.type = 'physical-examination-summary';
        examination.visit = 'soap';
        examination.createdBy = createdBy;
        await examination.save();
      }

      for (const diagnosis of param.diagnosis) {
        const patientDiagnosis = new PatientNote();
        patientDiagnosis.diagnosis = diagnosis.diagnosis;
        patientDiagnosis.status = 'Active';
        patientDiagnosis.patient = patient;
        patientDiagnosis.admission = admission;
        patientDiagnosis.nicu = nicu;
        patientDiagnosis.diagnosis_type = diagnosis.type.value;
        patientDiagnosis.comment = diagnosis.comment;
        patientDiagnosis.type = 'diagnosis';
        patientDiagnosis.visit = 'soap';
        patientDiagnosis.createdBy = createdBy;
        const pd = await patientDiagnosis.save();

        if (diagnosis?.status === 'critical') {
          const alert = new PatientAlert();
          alert.patient = patient;
          alert.category = diagnosis.status;
          alert.type = diagnosis.condition.value;
          alert.source = 'diagnosis';
          alert.item_id = pd.id;
          alert.message = `patient has been diagnosed of ${diagnosis.condition.label}`;
          alert.createdBy = createdBy;
          await alert.save();
        }
      }

      let reviewOfSystems = [];
      for (const exam of param.reviewOfSystem) {
        reviewOfSystems = [...reviewOfSystems, `${exam.label}: ${exam.value}`];
      }

      if (reviewOfSystems.length > 0) {
        const review = new PatientNote();
        review.description = reviewOfSystems.join(', ');
        review.patient = patient;
        review.admission = admission;
        review.nicu = nicu;
        review.type = 'review-of-systems';
        review.visit = 'soap';
        review.createdBy = createdBy;
        await review.save();
      }

      return { success: true };
    } catch (err) {
      console.log(err);
      return { success: false, message: err.message };
    }
  }
}
