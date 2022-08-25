import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EncounterRepository } from './encounter.repository';
import { EncounterDto } from './dto/encounter.dto';
import { Encounter } from './encouter.entity';
import { AppointmentRepository } from '../../frontdesk/appointment/appointment.repository';
import { PatientRepository } from '../repositories/patient.repository';
import { PatientRequestHelper } from '../../../common/utils/PatientRequestHelper';
import { RequestPaymentHelper } from '../../../common/utils/RequestPaymentHelper';
import { PaginationOptionsInterface } from '../../../common/paginate';
import * as moment from 'moment';
import { PatientNote } from '../entities/patient_note.entity';
import { AppGateway } from '../../../app.gateway';
import { QueueSystemRepository } from '../../frontdesk/queue-system/queue-system.repository';
import { PatientConsumable } from '../entities/patient_consumable.entity';
import { AuthRepository } from '../../auth/auth.repository';
import { Connection, getConnection, getRepository } from 'typeorm';
import { getStaff, removeEmptyLines } from '../../../common/utils/utils';
import { PatientNoteRepository } from '../repositories/patient_note.repository';
import { DrugGenericRepository } from '../../inventory/pharmacy/generic/generic.repository';
import { StoreInventoryRepository } from '../../inventory/store/store.repository';
import { PatientAlert } from '../entities/patient_alert.entity';
import { PatientVitalRepository } from '../repositories/patient_vitals.repository';
import { PatientRequestRepository } from '../repositories/patient_request.repository';
import { DoctorsAppointment } from '../../frontdesk/doctors-apointment/appointment.entity';
import { StaffRepository } from '../../hr/staff/staff.repository';
import { DepartmentRepository } from '../../settings/departments/department.repository';
const { log } = console;

@Injectable()
export class ConsultationService {
  constructor(
    private connection: Connection,
    private readonly appGateway: AppGateway,
    @InjectRepository(EncounterRepository)
    private encounterRepository: EncounterRepository,
    @InjectRepository(PatientRepository)
    private patientRepository: PatientRepository,
    @InjectRepository(AppointmentRepository)
    private appointmentRepository: AppointmentRepository,
    @InjectRepository(DrugGenericRepository)
    private drugGenericRepository: DrugGenericRepository,
    @InjectRepository(QueueSystemRepository)
    private queueSystemRepository: QueueSystemRepository,
    @InjectRepository(StoreInventoryRepository)
    private storeInventoryRepository: StoreInventoryRepository,
    @InjectRepository(PatientNoteRepository)
    private patientNoteRepository: PatientNoteRepository,
    @InjectRepository(AuthRepository)
    private readonly authRepository: AuthRepository,
    @InjectRepository(PatientVitalRepository)
    private patientVitalRepository: PatientVitalRepository,
    @InjectRepository(PatientRequestRepository)
    private patientRequestRepository: PatientRequestRepository,
    @InjectRepository(StaffRepository)
    private staffRepository: StaffRepository,
    @InjectRepository(DepartmentRepository)
    private departmentRepository: DepartmentRepository,
  ) { }

  async getEncounters(options: PaginationOptionsInterface, urlParams): Promise<any> {
    try {
      const { startDate, endDate, patient_id } = urlParams;

      const query = this.encounterRepository.createQueryBuilder('e').select('e.*');

      if (startDate && startDate !== '') {
        const start = moment(startDate).endOf('day').toISOString();
        query.where(`e.createdAt >= '${start}'`);
      }
      if (endDate && endDate !== '') {
        const end = moment(endDate).endOf('day').toISOString();
        query.andWhere(`e.createdAt <= '${end}'`);
      }

      if (patient_id && patient_id !== '') {
        query.andWhere('e.patient_id = :patient_id', { patient_id });
      }

      const page = options.page - 1;

      const total = await query.getCount();

      const items = await query
        .orderBy('e.createdAt', 'DESC')
        .take(options.limit)
        .skip(page * options.limit)
        .getRawMany();

      let result = [];

      for (const item of items) {
        const patient = await this.patientRepository.findOne(item.patient_id, {
          relations: ['nextOfKin', 'immunization', 'hmo'],
        });

        item.patient = patient;

        item.staff = await getStaff(item.createdBy);

        const date: string = moment(item.createdAt).format('YYYY-MM-DD');

        item.appointment = await this.appointmentRepository.findOne({
          where: { id: item.appointment_id },
          relations: ['whomToSee', 'consultingRoom', 'department'],
        });

        item.vitals = await this.patientVitalRepository
          .createQueryBuilder('v')
          .select('v.*')
          .where('v.patientId = :patient_id', { patient_id: patient.id })
          .andWhere('v.readingType != :type1', { type1: 'Fluid Chart' })
          .andWhere('v.readingType != :type2', { type2: 'regimen' })
          .andWhere(`CAST(v.createdAt as DATE) = '%${date}%'`)
          .getRawMany();

        item.patient_notes = await this.patientNoteRepository
          .createQueryBuilder('pn')
          .select('pn.*')
          .where('pn.encounter_id = :id', { id: item.id })
          .getRawMany();

        item.encounter_note = await this.patientNoteRepository
          .createQueryBuilder('n')
          .select('n.*')
          .where('n.encounter_id = :id', { id: item.id })
          .andWhere('n.type = :type', { type: 'encounter-note' })
          .getRawOne();

        item.allergies = await this.patientNoteRepository.find({
          where: { patient, type: 'allergy', encounter: item },
        });

        item.diagnosis = await this.patientNoteRepository.find({
          where: { patient, type: 'diagnosis', encounter: item },
        });

        item.investigations = await this.patientRequestRepository.find({
          where: { patient, encounter: item },
          relations: ['item'],
        });

        item.patient_consumables = await getRepository(PatientConsumable)
          .createQueryBuilder('pc')
          .select('pc.*')
          .where('pc.encounter_id = :id', { id: item.id })
          .getRawMany();

        result = [...result, item];
      }

      return {
        result,
        lastPage: Math.ceil(total / options.limit),
        itemsPerPage: options.limit,
        totalPages: total,
        currentPage: options.page,
      };
    } catch (err) {
      return {
        success: false,
        error: `${err.message || 'problem fetching encounter at the moment please try again later'}`,
      };
    }
  }

  async saveEncounter(patientId: number, param: EncounterDto, urlParam, username: string) {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const { appointment_id } = urlParam;
      const { investigations, nextAppointment } = param;

      if (!param.diagnosis || (param.diagnosis && param.diagnosis.length === 0)) {
        return { success: false, message: 'please add patient diagnosis' };
      }

      const patient = await this.patientRepository.findOne(patientId, {
        relations: ['hmo'],
      });

      const appointment = await this.appointmentRepository.findOne({
        where: { id: appointment_id },
        relations: ['patient', 'whomToSee', 'consultingRoom', 'transaction', 'department'],
      });

      const data = new Encounter();
      data.patient = patient;
      data.createdBy = username;
      const encounter = await data.save();

      // 9
      if (param.instruction !== '') {
        const instruction = new PatientNote();
        instruction.description = param.instruction;
        instruction.patient = patient;
        instruction.encounter = encounter;
        instruction.type = 'instruction';
        instruction.visit = 'encounter';
        instruction.createdBy = username;
        await instruction.save();
      }

      // 8
      const treatmentPlan = param.treatmentPlan
        .replace(/(<([^>]+)>)/gi, '')
        .replace(/&nbsp;/g, '')
        .replace('Treatment Plan', '')
        .replace(/\s/g, '')
        .replace(/\/r/g, '')
        .split(':')
        .join('');
      console.log(treatmentPlan);
      console.log(encodeURIComponent(treatmentPlan));

      if (encodeURIComponent(treatmentPlan) !== '%E2%80%8B') {
        const plan = new PatientNote();
        plan.description = param.treatmentPlan;
        plan.patient = patient;
        plan.encounter = encounter;
        plan.type = 'treatment-plan';
        plan.visit = 'encounter';
        plan.createdBy = username;
        await plan.save();
      }

      // 7
      for (const diagnosis of param.diagnosis) {
        const patientDiagnosis = new PatientNote();
        patientDiagnosis.diagnosis = diagnosis.diagnosis;
        patientDiagnosis.status = 'Active';
        patientDiagnosis.patient = patient;
        patientDiagnosis.encounter = encounter;
        patientDiagnosis.diagnosis_type = diagnosis.type.value;
        patientDiagnosis.comment = diagnosis.comment;
        patientDiagnosis.visit = 'encounter';
        patientDiagnosis.type = 'diagnosis';
        patientDiagnosis.createdBy = username;
        const pd = await patientDiagnosis.save();

        if (diagnosis?.status === 'critical') {
          const alert = new PatientAlert();
          alert.patient = patient;
          alert.category = diagnosis.status;
          alert.type = diagnosis.condition.value;
          alert.source = 'diagnosis';
          alert.item_id = pd.id;
          alert.message = `patient has been diagnosed of ${diagnosis.condition.label}`;
          alert.createdBy = username;
          await alert.save();
        }
      }

      // 6
      let physicalExaminations = [];
      for (const exam of param.physicalExamination) {
        physicalExaminations = [...physicalExaminations, `${exam.label}: ${exam.value}`];
      }

      if (physicalExaminations.length > 0) {
        const exam = new PatientNote();
        exam.description = physicalExaminations.join(', ');
        exam.patient = patient;
        exam.encounter = encounter;
        exam.type = 'physical-exam';
        exam.visit = 'encounter';
        exam.createdBy = username;
        await exam.save();
      }

      if (param.physicalExaminationNote !== '') {
        const exam = new PatientNote();
        exam.description = param.physicalExaminationNote;
        exam.patient = patient;
        exam.encounter = encounter;
        exam.type = 'physical-exam-note';
        exam.visit = 'encounter';
        exam.createdBy = username;
        await exam.save();
      }

      // 5
      for (const allergen of param.allergies) {
        const generic =
          allergen.generic_id && allergen.generic_id !== ''
            ? await this.drugGenericRepository.findOne(allergen.generic_id)
            : null;
        const patientAllergen = new PatientNote();
        patientAllergen.category = allergen.category.value;
        patientAllergen.allergy = allergen.allergen;
        patientAllergen.drugGeneric = generic;
        patientAllergen.severity = allergen.severity.value;
        patientAllergen.reaction = allergen.reaction;
        patientAllergen.patient = patient;
        patientAllergen.encounter = encounter;
        patientAllergen.visit = 'encounter';
        patientAllergen.type = 'allergy';
        patientAllergen.createdBy = username;
        await patientAllergen.save();
      }

      // 4
      if (param.medicalHistory) {
        let his = '';
        try {
          his = param.medicalHistory
            .replace(/(<([^>]+)>)/gi, '')
            .replace(/&nbsp;/g, '')
            .replace('Past Medical History', '')
            .replace(/\s/g, '')
            .replace(/\/r/g, '')
            .split(':')
            .join('');
        } catch (e) {
          console.log('------------------encounter error');
          console.log(param.medicalHistory);
          console.log(e);
        }
        console.log(his);
        console.log(encodeURIComponent(his));

        if (encodeURIComponent(his) !== '%E2%80%8B') {
          const patHistory = new PatientNote();
          patHistory.description = param.medicalHistory;
          patHistory.patient = patient;
          patHistory.encounter = encounter;
          patHistory.type = 'medical-history';
          patHistory.visit = 'encounter';
          patHistory.createdBy = username;
          await patHistory.save();
        }
      }

      // 3
      for (const item of param.patientHistorySelected) {
        const history = new PatientNote();
        history.category = item.category;
        history.history = item.description;
        history.patient = patient;
        history.encounter = encounter;
        history.type = 'patient-history';
        history.visit = 'encounter';
        history.createdBy = username;
        await history.save();
      }

      // 2
      let reviewOfSystems = [];
      for (const exam of param.reviewOfSystem) {
        reviewOfSystems = [...reviewOfSystems, `${exam.label}: ${exam.value}`];
      }

      if (reviewOfSystems.length > 0) {
        const review = new PatientNote();
        review.description = reviewOfSystems.join(', ');
        review.patient = patient;
        review.encounter = encounter;
        review.type = 'review-of-systems';
        review.visit = 'encounter';
        review.createdBy = username;
        await review.save();
      }

      // 1
      const complain = param.complaints
        .replace(/(<([^>]+)>)/gi, '')
        .replace(/&nbsp;/g, '')
        .replace('Presenting Complaints', '')
        .replace('History of complains', '')
        .replace(/\s/g, '')
        .replace(/\/r/g, '')
        .split(':')
        .join('');

      console.log(complain);
      console.log(encodeURIComponent(complain));

      if (encodeURIComponent(complain) !== '%E2%80%8B') {
        const complaint = new PatientNote();
        complaint.description = param.complaints;
        complaint.patient = patient;
        complaint.encounter = encounter;
        complaint.type = 'complaints';
        complaint.visit = 'encounter';
        complaint.createdBy = username;
        await complaint.save();
      }

      if (param.consumables) {
        for (const item of param.consumables.items) {
          const consumableItem = await this.storeInventoryRepository.findOne(item.item.id);
          const consumable = new PatientConsumable();
          consumable.quantity = item.quantity;
          consumable.consumable = consumableItem;
          consumable.patient = patient;
          consumable.encounter = encounter;
          consumable.request_note = param.consumables.request_note;
          consumable.createdBy = username;
          await consumable.save();
        }
      }

      if (investigations.labRequest && investigations.labRequest.tests.length > 0) {
        const labRequest = await PatientRequestHelper.handleLabRequest(
          investigations.labRequest,
          patient,
          username,
          encounter,
        );
        console.log(labRequest);
        if (labRequest.success && labRequest.data.length > 0) {
          // save transaction
          const payment = await RequestPaymentHelper.clinicalLabPayment(
            labRequest.data,
            patient,
            username,
            investigations.labRequest.pay_later,
          );
          this.appGateway.server.emit('paypoint-queue', {
            payment: payment.transactions,
          });
        }
      }

      if (investigations.radiologyRequest && investigations.radiologyRequest.tests.length > 0) {
        const request = await PatientRequestHelper.handleServiceRequest(
          investigations.radiologyRequest,
          patient,
          username,
          'scans',
          'encounter',
          encounter,
        );
        console.log(request);
        if (request.success && request.data.length > 0) {
          // save transaction
          const payment = await RequestPaymentHelper.servicePayment(
            request.data,
            patient,
            username,
            'scans',
            investigations.radiologyRequest.pay_later,
          );
          this.appGateway.server.emit('paypoint-queue', {
            payment: payment.transactions,
          });
        }
      }

      if (investigations.procedureRequest && investigations.procedureRequest.tests.length > 0) {
        const procedure = await PatientRequestHelper.handleServiceRequest(
          investigations.procedureRequest,
          patient,
          username,
          'procedure',
          'encounter',
          encounter,
        );
        console.log(procedure);
        if (procedure.success && procedure.data.length > 0) {
          // save transaction
          const payment = await RequestPaymentHelper.servicePayment(
            procedure.data,
            patient,
            username,
            'procedure',
            investigations.procedureRequest.bill,
          );
          this.appGateway.server.emit('paypoint-queue', {
            payment: payment.transactions,
          });
        }
      }

      if (investigations.pharmacyRequest && investigations.pharmacyRequest.items.length > 0) {
        const regimen = await PatientRequestHelper.handlePharmacyRequest(
          investigations.pharmacyRequest,
          patient,
          username,
          'encounter',
          encounter,
        );
        console.log(regimen);
      }

      if (nextAppointment && nextAppointment.datetime && nextAppointment.datetime !== '') {
        const doctor = await this.staffRepository.findOne(nextAppointment.doctor_id);

        const department_id = appointment?.department?.id || null;
        const department = department_id ? await this.departmentRepository.findOne(department_id) : null;

        const date = moment(nextAppointment.datetime);

        const newAppointment = new DoctorsAppointment();
        newAppointment.patient = patient;
        newAppointment.doctor = doctor;
        newAppointment.appointment_datetime = nextAppointment.datetime;
        newAppointment.appointment_date = date.format('YYYY-MM-DD');
        newAppointment.appointment_time = date.format('HH:mm:ss');
        newAppointment.appointment_duration = {
          duration: nextAppointment.duration,
          duration_type: nextAppointment.duration_type,
        };
        newAppointment.department = department;
        newAppointment.createdBy = username;
        await newAppointment.save();
      }

      appointment.status = 'Completed';
      appointment.encounter = encounter;
      appointment.lastChangedBy = username;
      const rs = await appointment.save();

      await this.queueSystemRepository.delete({ appointment });

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return { success: true, appointment: { ...rs, encounter } };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      console.log(err);
      return { success: false, message: err.message };
    }
  }

  async getFormattedEncounters(options: PaginationOptionsInterface, params) {
    try {
      let response = await this.getEncounters(options, params);

      if (response.result) {
        let results = response.result;

        for (let result of results) {
          removeEmptyLines(result.patient_notes);
        };
        return response;
      };

      return response;
    } catch (error) {
      log(error);
    }
  }
}
