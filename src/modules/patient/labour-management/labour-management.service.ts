import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LabourEnrollmentRepository } from './repositories/labour-enrollment.repository';
import { LabourEnrollmentDto } from './dto/labour-enrollment.dto';
import { PatientRepository } from '../repositories/patient.repository';
import * as moment from 'moment';
import { LabourEnrollment } from './entities/labour_enrollment.entity';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { getStaff } from '../../../common/utils/utils';
import { AntenatalEnrollmentRepository } from '../antenatal/enrollment.repository';
import { getConnection } from 'typeorm';
import { LabourMeasurementRepository } from './repositories/labour-measurement.repository';
import { LabourRiskAssessmentRepository } from './repositories/labour-risk-assessment.repository';
import { LabourDeliveryRecordRepository } from './repositories/labour-delivery-record.repository';
import { LabourMeasurementDto } from './dto/labour-measurement.dto';
import { LabourRiskAssessmentDto } from './dto/labour-risk-assessment.dto';
import { LabourDeliveryRecordDto } from './dto/labour-delivery.dto';
import { LabourMeasurement } from './entities/labour_measurement.entity';
import { LabourRiskAssessment } from './entities/labour_risk_assessment.entity';
import { LabourDeliveryRecord } from './entities/labour_delivery_record.entity';
import { StaffRepository } from '../../hr/staff/staff.repository';

@Injectable()
export class LabourManagementService {
  constructor(
    @InjectRepository(LabourEnrollmentRepository)
    private labourEnrollmentRepository: LabourEnrollmentRepository,
    @InjectRepository(PatientRepository)
    private patientRepository: PatientRepository,
    @InjectRepository(AntenatalEnrollmentRepository)
    private ancEnrollmentRepository: AntenatalEnrollmentRepository,
    @InjectRepository(LabourMeasurementRepository)
    private labourMeasurementRepository: LabourMeasurementRepository,
    @InjectRepository(LabourRiskAssessmentRepository)
    private labourRiskAssessmentRepository: LabourRiskAssessmentRepository,
    @InjectRepository(LabourDeliveryRecordRepository)
    private labourDeliveryRecordRepository: LabourDeliveryRecordRepository,
    @InjectRepository(StaffRepository)
    private staffRepository: StaffRepository,
  ) {}

  async getLabours(options: PaginationOptionsInterface, urlParams): Promise<any> {
    const { startDate, endDate, patient_id } = urlParams;

    const page = options.page - 1;

    const query = this.labourEnrollmentRepository.createQueryBuilder('q').select('q.*');

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

    const labours = await query
      .offset(page * options.limit)
      .limit(options.limit)
      .orderBy('q.createdAt', 'DESC')
      .getRawMany();

    const total = await query.getCount();

    let result = [];
    for (const labour of labours) {
      labour.patient = await this.patientRepository.findOne(labour.patient_id, {
        relations: ['nextOfKin', 'immunization', 'hmo'],
      });

      labour.staff = await getStaff(labour.createdBy);
      labour.antenatal = labour.antenatal_id ? await this.ancEnrollmentRepository.findOne(labour.antenatal_id) : null;

      const assessments = await this.labourRiskAssessmentRepository.find({ where: { enrolment: labour } });
      labour.assessment = assessments.length > 0;

      result = [...result, labour];
    }

    return {
      result,
      lastPage: Math.ceil(total / options.limit),
      itemsPerPage: options.limit,
      totalPages: total,
      currentPage: options.page,
    };
  }

  async saveEnrollment(params: LabourEnrollmentDto, createdBy): Promise<any> {
    try {
      const { patient_id, antenatal_id, father, alive, miscarriage, present_pregnancies, lmp } = params;

      const requestCount = await getConnection()
        .createQueryBuilder()
        .select('*')
        .from(LabourEnrollment, 'q')
        .withDeleted()
        .getCount();

      const nextId = `00000${requestCount + 1}`;
      const code = `LB${moment().format('YY')}/${moment().format('MM')}/${nextId.slice(-5)}`;

      const patient = await this.patientRepository.findOne(patient_id);

      const antenatal =
        antenatal_id && antenatal_id !== '' ? await this.ancEnrollmentRepository.findOne(antenatal_id) : null;

      const enrollment = new LabourEnrollment();
      enrollment.serial_code = code;
      enrollment.patient = patient;
      enrollment.antenatal = antenatal;
      enrollment.father = father;
      enrollment.alive = alive;
      enrollment.miscarriage = miscarriage;
      enrollment.present_pregnancies = present_pregnancies;
      enrollment.lmp = lmp;
      enrollment.status = 0;
      enrollment.createdBy = createdBy;

      const rs = await this.labourEnrollmentRepository.save(enrollment);

      patient.labour_id = rs.id;
      await patient.save();

      return { success: true, enrollment: rs };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  async fetchMeasurements(id: number, options: PaginationOptionsInterface): Promise<any> {
    const page = options.page - 1;

    const query = this.labourMeasurementRepository
      .createQueryBuilder('q')
      .select('q.*')
      .where('q.enrollment_id = :labour_id', { labour_id: id });

    const measurements = await query
      .offset(page * options.limit)
      .limit(options.limit)
      .orderBy('q.createdAt', 'DESC')
      .getRawMany();

    const total = await query.getCount();

    let result = [];
    for (const item of measurements) {
      item.patient = await this.patientRepository.findOne(item.patient_id, {
        relations: ['nextOfKin', 'immunization', 'hmo'],
      });

      item.labourEnrolment = await this.labourEnrollmentRepository.findOne(item.enrollment_id);

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

  async saveMeasurement(id: number, params: LabourMeasurementDto, username: string): Promise<any> {
    try {
      const {
        patient_id,
        labour_sign,
        presentation,
        position_of_foetus,
        fetal_lie,
        descent,
        cervical_length,
        cervical_effacement,
        cervical_position,
        membranes,
        moulding,
        caput,
        has_passed_urine,
        administered_oxytocin,
        administered_other_drugs,
        measurements,
      } = params;

      const enrollment = await this.labourEnrollmentRepository.findOne(id);
      if (!enrollment) {
        throw new BadRequestException('enrollment not found!');
      }

      const patient = await this.patientRepository.findOne(patient_id);

      const measurement = new LabourMeasurement();
      measurement.enrolment = enrollment;
      measurement.patient = patient;
      measurement.labour_sign = labour_sign;
      measurement.presentation = presentation;
      measurement.position_of_foetus = position_of_foetus;
      measurement.fetal_lie = fetal_lie;
      measurement.descent = descent;
      measurement.cervical_length = cervical_length;
      measurement.cervical_effacement = cervical_effacement;
      measurement.cervical_position = cervical_position;
      measurement.membranes = membranes;
      measurement.moulding = moulding;
      measurement.caput = caput;
      measurement.has_passed_urine = has_passed_urine;
      measurement.administered_oxytocin = administered_oxytocin;
      measurement.administered_other_drugs = administered_other_drugs;
      measurement.measurements = measurements;
      measurement.createdBy = username;

      const rs = await this.labourMeasurementRepository.save(measurement);

      return { success: true, measurement: rs };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  async fetchRiskAssessment(id: number): Promise<any> {
    const query = this.labourRiskAssessmentRepository
      .createQueryBuilder('q')
      .select('q.*')
      .where('q.enrollment_id = :labour_id', { labour_id: id });

    const rs = await query.getRawOne();

    return { success: true, risk_assessment: rs };
  }

  async saveRiskAssessment(id: number, params: LabourRiskAssessmentDto, username: string): Promise<any> {
    try {
      const {
        patient_id,
        risk_score,
        height,
        weight,
        previous_pregnancy_outcome,
        history_low_birth_weight,
        previous_pregnancy_experience,
        note,
      } = params;

      const enrollment = await this.labourEnrollmentRepository.findOne(id);
      if (!enrollment) {
        throw new BadRequestException('enrollment not found!');
      }

      const patient = await this.patientRepository.findOne(patient_id);

      const riskAssessment = new LabourRiskAssessment();
      riskAssessment.enrolment = enrollment;
      riskAssessment.patient = patient;
      riskAssessment.risk_score = risk_score;
      riskAssessment.height = height;
      riskAssessment.weight = weight;
      riskAssessment.previous_pregnancy_outcome = previous_pregnancy_outcome;
      riskAssessment.history_low_birth_weight = history_low_birth_weight;
      riskAssessment.previous_pregnancy_experience = previous_pregnancy_experience;
      riskAssessment.note = note;
      riskAssessment.createdBy = username;

      const rs = await this.labourRiskAssessmentRepository.save(riskAssessment);

      return { success: true, riskAssessment: rs };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  async fetchDeliveryRecord(id: number): Promise<any> {
    const query = this.labourDeliveryRecordRepository
      .createQueryBuilder('q')
      .select('q.*')
      .where('q.enrollment_id = :labour_id', { labour_id: id });

    const rs = await query.getRawOne();

    if (rs) {
      rs.pediatrician = rs.pediatrician_id ? await this.staffRepository.findOne(rs.pediatrician_id) : null;
    }

    return { success: true, delivery_record: rs };
  }

  async saveDeliveryRecord(id: number, params: LabourDeliveryRecordDto, username: string): Promise<any> {
    try {
      const {
        patient_id,
        delivery_type,
        is_mother_alive,
        is_baby_alive,
        administered_oxytocin,
        placenta_delivered,
        normal_bleeding,
        date_of_birth,
        time_of_birth,
        baby_cried_immediately,
        sex_of_baby,
        apgar_score,
        weight,
        administered_vitamin_k,
        mother_rh_negative,
        drugs_administered,
        transferred_to,
        comment,
        pediatrician_id,
      } = params;

      const enrollment = await this.labourEnrollmentRepository.findOne(id);
      if (!enrollment) {
        throw new BadRequestException('enrollment not found!');
      }

      const patient = await this.patientRepository.findOne(patient_id);
      const pediatrician =
        pediatrician_id && pediatrician_id !== '' ? await this.staffRepository.findOne(pediatrician_id) : null;

      enrollment.delivered = 1;
      await enrollment.save();

      const delivery = new LabourDeliveryRecord();
      delivery.enrolment = enrollment;
      delivery.patient = patient;
      delivery.delivery_type = delivery_type;
      delivery.is_mother_alive = is_mother_alive;
      delivery.is_baby_alive = is_baby_alive;
      delivery.administered_oxytocin = administered_oxytocin;
      delivery.placenta_delivered = placenta_delivered;
      delivery.normal_bleeding = normal_bleeding;
      delivery.date_of_birth = date_of_birth;
      delivery.time_of_birth = time_of_birth;
      delivery.baby_cried_immediately = baby_cried_immediately;
      delivery.sex_of_baby = sex_of_baby;
      delivery.apgar_score = apgar_score;
      delivery.weight = weight;
      delivery.administered_vitamin_k = administered_vitamin_k;
      delivery.mother_rh_negative = mother_rh_negative;
      delivery.drugs_administered = drugs_administered;
      delivery.transferred_to = transferred_to;
      delivery.comment = comment;
      delivery.pediatrician = pediatrician;
      delivery.createdBy = username;

      const rs = await this.labourDeliveryRecordRepository.save(delivery);

      rs.pediatrician = pediatrician;

      return { success: true, delivery: rs };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  async close(id: number, params: any, username: string): Promise<any> {
    try {
      const enrollment = await this.labourEnrollmentRepository.findOne(id, {
        relations: ['patient'],
      });
      if (!enrollment) {
        return { success: false, message: 'labour enrollment not found' };
      }

      enrollment.date_closed = moment().format('YYYY-MM-DD HH:mm:ss');
      enrollment.closedBy = await getStaff(username);
      enrollment.status = 1;
      enrollment.lastChangedBy = username;
      const rs = await enrollment.save();

      const patient = await this.patientRepository.findOne(enrollment.patient.id);
      patient.labour_id = null;
      await patient.save();

      rs.closedBy = await getStaff(username);

      return { success: true, enrollment: rs };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }
}
