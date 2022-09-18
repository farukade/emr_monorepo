import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppointmentRepository } from './appointment.repository';
import { AppointmentDto } from './dto/appointment.dto';
import { PatientRepository } from '../../patient/repositories/patient.repository';
import { DepartmentRepository } from '../../settings/departments/department.repository';
import { ConsultingRoomRepository } from '../../settings/consulting-room/consulting-room.repository';
import { Appointment } from './appointment.entity';
import * as moment from 'moment';
import { QueueSystemRepository } from '../queue-system/queue-system.repository';
import { Service } from '../../settings/entities/service.entity';
import { ServiceRepository } from '../../settings/services/repositories/service.repository';
import { Patient } from '../../patient/entities/patient.entity';
import { TransactionsRepository } from '../../finance/transactions/transactions.repository';
import { AppGateway } from '../../../app.gateway';
import { getConnection, getRepository } from 'typeorm';
import { StaffDetails } from '../../hr/staff/entities/staff_details.entity';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { PaginationOptionsInterface } from '../../../common/paginate';
import {
  callPatient,
  getLastAppointment,
  getOutstanding,
  getStaff,
  postCredit,
  postDebit,
} from '../../../common/utils/utils';
import { ServiceCostRepository } from '../../settings/services/repositories/service_cost.repository';
import { ServiceCost } from '../../settings/entities/service_cost.entity';
import { StaffRepository } from '../../hr/staff/staff.repository';
import { AntenatalEnrollmentRepository } from '../../patient/antenatal/enrollment.repository';
import { AntenatalAssessmentRepository } from '../../patient/antenatal/antenatal-assessment.repository';
import { TransactionCreditDto } from '../../finance/transactions/dto/transaction-credit.dto';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(AppointmentRepository)
    private appointmentRepository: AppointmentRepository,
    @InjectRepository(PatientRepository)
    private patientRepository: PatientRepository,
    @InjectRepository(DepartmentRepository)
    private departmentRepository: DepartmentRepository,
    @InjectRepository(ConsultingRoomRepository)
    private consultingRoomRepository: ConsultingRoomRepository,
    @InjectRepository(QueueSystemRepository)
    private queueSystemRepository: QueueSystemRepository,
    @InjectRepository(ServiceRepository)
    private serviceRepository: ServiceRepository,
    @InjectRepository(TransactionsRepository)
    private transactionsRepository: TransactionsRepository,
    @InjectRepository(ServiceCostRepository)
    private serviceCostRepository: ServiceCostRepository,
    @InjectRepository(StaffRepository)
    private staffRepository: StaffRepository,
    @InjectRepository(AntenatalEnrollmentRepository)
    private ancEnrollmentRepository: AntenatalEnrollmentRepository,
    @InjectRepository(AntenatalAssessmentRepository)
    private antenatalAssessmentRepository: AntenatalAssessmentRepository,
    private readonly appGateway: AppGateway,
  ) {}

  async listAppointments(options: PaginationOptionsInterface, params): Promise<Pagination> {
    const { startDate, endDate, patient_id, today, department_id, canSeeDoctor, status, is_queue, staff_id } = params;

    const query = this.appointmentRepository.createQueryBuilder('q').select('q.id');

    if (params.type && params.type !== '') {
      query.where('q.appointmentType = :type', { type: params.type });
    }

    if (canSeeDoctor && canSeeDoctor !== '') {
      query.where('q.canSeeDoctor = :canSeeDoctor', { canSeeDoctor });
    }

    if (today && today !== '') {
      query.andWhere(`CAST(q.appointment_date as text) LIKE '%${today}%'`);
    }

    if (startDate && startDate !== '') {
      const start = moment(startDate).startOf('day').toISOString();
      query.andWhere(`q.appointment_date >= '${start}'`);
    }

    if (endDate && endDate !== '') {
      const end = moment(endDate).endOf('day').toISOString();
      query.andWhere(`q.appointment_date <= '${end}'`);
    }

    if (patient_id && patient_id !== '') {
      query.andWhere('q.patient_id = :patient_id', { patient_id });
    }

    if (is_queue && is_queue === 1) {
      // query.andWhere(new Brackets(qb => {
      // 	qb.where('q.doctor_id = :doctor_id', { doctor_id })
      // 		.orWhere('q.department_id = :department_id', { department_id });
      // }));
    }

    if (staff_id && staff_id !== '') {
      query.andWhere('q.doctor_id = :staff_id', { staff_id });
    }

    if (department_id && department_id !== '') {
      query.andWhere('q.department_id = :department_id', { department_id });
    }

    if (status && status !== '') {
      if (status === 'Pending') {
        query.andWhere('q.status Like :status', { status: '%Pending%' });
      } else {
        query.andWhere('q.status = :status', { status });
      }
    }

    const page = options.page - 1;
    const order = is_queue && is_queue === 1 ? 'ASC' : 'DESC';

    const appointments = await query
      .offset(page * options.limit)
      .limit(options.limit)
      .orderBy('q.createdAt', order)
      .withDeleted()
      .getMany();

    const total = await query.getCount();

    let items = [];
    for (const item of appointments) {
      const appointment = await this.appointmentRepository.findOne({
        where: { id: item.id },
        relations: ['patient', 'whomToSee', 'consultingRoom', 'transaction', 'department'],
        withDeleted: true,
      });

      const patientProfile = await this.patientRepository.findOne({
        where: { id: appointment.patient.id },
        relations: ['hmo', 'immunization', 'nextOfKin'],
      });

      const ancEnrolment = await this.ancEnrollmentRepository.findOne({
        where: { patient: patientProfile, status: 0 },
        relations: ['ancpackage'],
      });

      let antenatal = null;
      if (ancEnrolment) {
        const staff = await getStaff(ancEnrolment.createdBy);
        antenatal = { ...ancEnrolment, patient: patientProfile, staff };
      }

      const assessment = await this.antenatalAssessmentRepository.findOne({
        where: { appointment },
      });

      const outstanding = await getOutstanding(patientProfile.id);
      const lastAppointment = await getLastAppointment(patientProfile.id);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { patient, ...others } = appointment;
      const appt = {
        ...others,
        patient: { ...patientProfile, outstanding, lastAppointment },
        antenatal,
        assessment,
      };

      items = [...items, appt];
    }

    return {
      result: items,
      lastPage: Math.ceil(total / options.limit),
      itemsPerPage: options.limit,
      totalPages: total,
      currentPage: options.page,
    };
  }

  async patientAppointments(id: number): Promise<Appointment[]> {
    const patient = await this.patientRepository.findOne(id);

    const appointments = await this.appointmentRepository.find({
      where: { patient },
      relations: ['patient', 'whomToSee', 'consultingRoom', 'encounter', 'transaction', 'department'],
    });

    return appointments;
  }

  async getAppointment(id: number): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['patient', 'whomToSee', 'consultingRoom', 'encounter', 'transaction', 'department'],
    });

    return appointment;
  }

  async saveNewAppointment(appointmentDto: AppointmentDto, username: string): Promise<any> {
    try {
      const { patient_id, doctor_id, consulting_room_id, sendToQueue, department_id, consultation_id, service_id } =
        appointmentDto;

      const pushToQueue =
        moment(appointmentDto.appointment_date).format('DDMMYYYY') === moment().format('DDMMYYYY') && sendToQueue;

      // find patient details
      const patient = await this.patientRepository.findOne(patient_id, {
        relations: ['hmo'],
      });
      if (!patient) {
        return { success: false, message: 'please select a patient' };
      }

      const hmo = patient.hmo;

      // find doctor
      let doctor = null;
      if (doctor_id) {
        doctor = await getRepository(StaffDetails).findOne(doctor_id);
      }

      // find consulting room
      let consultingRoom = null;
      if (consulting_room_id) {
        consultingRoom = await this.consultingRoomRepository.findOne(consulting_room_id);
      }

      // find service
      const service = await this.serviceRepository.findOne(service_id);
      let serviceCost = await this.serviceCostRepository.findOne({
        where: { code: service.code, hmo },
      });
      if (!serviceCost) {
        const cost = new ServiceCost();
        cost.code = service.code;
        cost.item = service;
        cost.hmo = hmo;
        cost.tariff = 0;
        serviceCost = await cost.save();
      }

      // find department
      const department = await this.departmentRepository.findOne(department_id);

      let ancEnrollment = null;
      if (department.name === 'Antenatal') {
        ancEnrollment = await this.ancEnrollmentRepository.findOne({
          where: { patient, status: 0 },
          relations: ['ancpackage'],
        });
      }

      const covered = ancEnrollment?.ancpackage?.coverage?.consultancy?.find((c) => c.code === serviceCost?.code) || null;
      const isCovered = covered && department.name === 'Antenatal';

      const appointment = await this.appointmentRepository.saveAppointment(
        appointmentDto,
        patient,
        consultingRoom,
        doctor,
        service,
        serviceCost,
        department,
        username,
      );

      // update patient appointment date
      patient.last_appointment_date =
        moment(appointmentDto.appointment_date).format('DDMMYYYY') !== moment().format('DDMMYYYY')
          ? patient.last_appointment_date
          : appointmentDto.appointment_date;
      await patient.save();

      let queue;

      // update appointment status
      appointment.status =
        consultation_id === 'initial'
          ? hmo.name === 'Private'
            ? 'Pending Paypoint Approval'
            : 'Pending HMO Approval'
          : 'Approved';

      if (isCovered) {
        appointment.status = 'Approved';
        appointment.is_covered = true;
      } else {
        appointment.is_covered = false;
      }

      appointment.consultation_type = consultation_id;
      await appointment.save();

      if (consultation_id === 'initial') {
        // save payment
        const amount = serviceCost?.tariff || 0;
        const payment = await this.saveTransaction(patient, hmo, service, serviceCost, username, appointment);
        await getConnection()
          .createQueryBuilder()
          .update(Appointment)
          .set({ transaction: payment })
          .where('id = :id', { id: appointment.id })
          .execute();

        // send queue message
        if (pushToQueue) {
          const type = isCovered ? 'vitals' : hmo.name === 'Private' ? 'paypoint' : 'hmo';
          queue = await this.queueSystemRepository.saveQueue(appointment, type, patient);
          this.appGateway.server.emit('paypoint-queue', { queue, payment });

          appointment.is_queued = true;
          await appointment.save();
        }

        if (isCovered) {
          // credit paypoint
          const creditData: TransactionCreditDto = {
            patient_id: patient.id,
            username,
            sub_total: 0,
            vat: 0,
            amount: Math.abs(amount),
            voucher_amount: 0,
            amount_paid: Math.abs(amount),
            change: 0,
            description: payment.description,
            payment_method: 'ANC Covered',
            part_payment_expiry_date: null,
            bill_source: payment.bill_source,
            next_location: null,
            status: 1,
            hmo_approval_code: null,
            transaction_details: null,
            admission_id: null,
            nicu_id: null,
            staff_id: null,
            lastChangedBy: username,
          };

          // approve debit
          payment.next_location = null;
          payment.status = 1;
          payment.lastChangedBy = username;
          payment.amount_paid = Math.abs(amount);
          payment.payment_method = 'ANC Covered';
          payment.next_location = null;
          await payment.save();

          await postCredit(creditData, payment.service, null, payment.patientRequestItem, null, hmo);
        }
      } else {
        // send queue message
        if (pushToQueue) {
          queue = await this.queueSystemRepository.saveQueue(appointment, 'vitals', patient);
          this.appGateway.server.emit('nursing-queue', { queue });

          appointment.is_queued = true;
          await appointment.save();
        }
      }

      // go to front desk
      this.appGateway.server.emit('new-appointment', {
        success: true,
        appointment,
      });

      return { success: true, appointment };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message };
    }
  }

  async queueAppointment(id: number, appointmentDto: AppointmentDto, username: string): Promise<any> {
    try {
      const { patient_id, doctor_id, consulting_room_id, department_id, consultation_id, service_id } = appointmentDto;

      // find patient details
      const patient = await this.patientRepository.findOne(patient_id, {
        relations: ['hmo', 'immunization', 'nextOfKin'],
      });
      if (!patient) {
        return { success: false, message: 'please select a patient' };
      }

      const hmo = patient.hmo;

      // find doctor
      let doctor = null;
      if (doctor_id) {
        doctor = await getRepository(StaffDetails).findOne(doctor_id);
      }

      // find consulting room
      let consultingRoom = null;
      if (consulting_room_id) {
        consultingRoom = await this.consultingRoomRepository.findOne(consulting_room_id);
      }

      // find service
      const service = await this.serviceRepository.findOne(service_id);
      let serviceCost = await this.serviceCostRepository.findOne({
        where: { code: service.code, hmo },
      });
      if (!serviceCost) {
        const cost = new ServiceCost();
        cost.code = service.code;
        cost.item = service;
        cost.hmo = hmo;
        cost.tariff = 0;
        serviceCost = await cost.save();
      }

      // find department
      const department = await this.departmentRepository.findOne(department_id);

      let ancEnrollment = null;
      if (department.name === 'Antenatal') {
        ancEnrollment = await this.ancEnrollmentRepository.findOne({
          where: { patient, status: 0 },
          relations: ['ancpackage'],
        });
      }

      const covered = ancEnrollment?.ancpackage?.coverage?.consultancy?.find((c) => c.code === serviceCost?.code) || null;
      const isCovered = covered && department.name === 'Antenatal';

      const appointment = await this.appointmentRepository.findOne(id);

      if (!appointment) {
        return { success: false, message: 'appointment not found' };
      }

      appointment.whomToSee = doctor;
      appointment.consultingRoom = consultingRoom;
      appointment.appointment_date = appointmentDto.appointment_date;
      appointment.serviceCategory = service.category;
      appointment.service = serviceCost;
      appointment.description = appointmentDto.description;
      appointment.department = department;
      appointment.lastChangedBy = username;
      appointment.status =
        consultation_id === 'initial'
          ? hmo.name === 'Private'
            ? 'Pending Paypoint Approval'
            : 'Pending HMO Approval'
          : 'Approved';
      if (isCovered) {
        appointment.status = 'Approved';
        appointment.is_covered = true;
      } else {
        appointment.is_covered = false;
      }
      appointment.consultation_type = consultation_id;
      appointment.is_queued = true;
      await appointment.save();

      // update patient appointment date
      patient.last_appointment_date = appointmentDto.appointment_date;
      await patient.save();

      let payment;
      if (consultation_id === 'initial') {
        // save payment
        const amount = serviceCost?.tariff || 0;
        payment = await this.saveTransaction(patient, hmo, service, serviceCost, username, appointment);
        await getConnection()
          .createQueryBuilder()
          .update(Appointment)
          .set({ transaction: payment })
          .where('id = :id', { id: appointment.id })
          .execute();

        if (isCovered && payment) {
          // credit paypoint
          const creditData: TransactionCreditDto = {
            patient_id: patient.id,
            username,
            sub_total: 0,
            vat: 0,
            amount: Math.abs(amount),
            voucher_amount: 0,
            amount_paid: Math.abs(amount),
            change: 0,
            description: payment.description,
            payment_method: 'ANC Covered',
            part_payment_expiry_date: null,
            bill_source: payment.bill_source,
            next_location: null,
            status: 1,
            hmo_approval_code: null,
            transaction_details: null,
            admission_id: null,
            nicu_id: null,
            staff_id: null,
            lastChangedBy: username,
          };

          // approve debit
          payment.next_location = null;
          payment.status = 1;
          payment.lastChangedBy = username;
          payment.amount_paid = Math.abs(amount);
          payment.payment_method = 'ANC Covered';
          payment.next_location = null;
          await payment.save();

          await postCredit(creditData, payment.service, null, payment.patientRequestItem, null, hmo);
        }
      }

      const outstanding = await getOutstanding(patient.id);
      const lastAppointment = await getLastAppointment(patient.id);

      appointment.patient = patient;
      appointment.whomToSee = doctor;
      appointment.consultingRoom = consultingRoom;
      appointment.transaction = payment;
      appointment.department = department;

      let antenatal = null;
      if (ancEnrollment) {
        const staff = await getStaff(ancEnrollment.createdBy);
        antenatal = { ...ancEnrollment, patient, staff };
      }

      const assessment = await this.antenatalAssessmentRepository.findOne({
        where: { appointment },
      });

      // send queue message
      const checkHmo = hmo.name === 'Private' ? 'paypoint' : 'hmo';
      const checkCoverage = isCovered ? 'vitals' : checkHmo;
      const type = consultation_id === 'initial' ? checkCoverage : 'vitals';
      const queue = await this.queueSystemRepository.saveQueue(appointment, type, patient);
      if (consultation_id === 'initial') {
        this.appGateway.server.emit('paypoint-queue', { queue, payment });
      } else {
        this.appGateway.server.emit('nursing-queue', { queue });
      }

      const appt = {
        ...appointment,
        patient: { ...patient, outstanding, lastAppointment },
        antenatal,
        assessment,
      };

      // go to front desk
      this.appGateway.server.emit('new-appointment', {
        success: true,
        appointment: appt,
      });

      return { success: true, appointment: appt };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message };
    }
  }

  async getActivePatientAppointment(patientId) {
    return await this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .where('appointment.patient_id = :patient_id', { patientId })
      .andWhere('appointment.isActive = :status', { status: true })
      .getOne();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async checkAppointmentStatus(param) {
    // const { patient_id, service_id } = params;
    // find service
    // const service = await this.serviceRepository.findOne(service_id);
    // let resGracePeriod;
    // let resNoOfVisits;
    // if (service.gracePeriod) {
    //     const gracePeriodParams = service.gracePeriod.split(' ');
    //     resGracePeriod = await this.verifyGracePeriod(gracePeriodParams, patient_id, service_id);
    // }
    //
    // if (service.noOfVisits) {
    //     resNoOfVisits = await this.verifyNoOfVisits(service.noOfVisits, patient_id, service_id);
    // }

    // if (resGracePeriod && resNoOfVisits) {
    //     return { isPaying: false, amount: 0 };
    // } else {
    //     return { isPaying: true, amount: parseInt(service.tariff, 10) };
    // }

    return { isPaying: false, amount: 0 };
  }

  async closeAppointment(id) {
    // find appointment
    const appointment = await this.appointmentRepository.findOne(id);
    // update status
    appointment.isActive = false;
    await appointment.save();
    // remove from queue
    await this.queueSystemRepository.delete({ appointment });
    return appointment;
  }

  async cancelAppointment(id, username: string) {
    // find appointment
    const appointment = await this.appointmentRepository.findOne(id, {
      relations: ['transaction'],
    });
    // update status
    appointment.isActive = false;
    appointment.status = 'Cancelled';
    appointment.deletedBy = username;
    await appointment.save();

    if (appointment.transaction) {
      const transaction = await this.transactionsRepository.findOne(appointment.transaction.id);
      transaction.deletedBy = username;
      await transaction.save();
      await transaction.softRemove();
    }

    // remove from queue
    await this.queueSystemRepository.delete({ appointment });
    return await appointment.softRemove();
  }

  async acceptAppointment({ appointmentId, action, doctor_id, consulting_room_id }, username: string) {
    try {
      const doctor = await getRepository(StaffDetails).findOne(doctor_id);
      console.log('-------1');

      const appointment = await this.getAppointment(appointmentId);
      console.log('-------2');

      if (doctor) {
        appointment.whomToSee = doctor;
      }
      console.log('-------3');

      if (consulting_room_id) {
        const room = await this.consultingRoomRepository.findOne(consulting_room_id);
        appointment.consultingRoom = room;

        await callPatient(appointment, room);
      }
      console.log('-------4');

      appointment.doctorStatus = action;
      appointment.lastChangedBy = username;
      await appointment.save();
      console.log('-------5');

      this.appGateway.server.emit('appointment-update', {
        appointment,
        action,
      });
      console.log('-------6');
      return { success: true, appointment };
    } catch (e) {
      console.log(e);
      return { success: false, message: e.message };
    }
  }

  async repeatPrompt(appointmentId: number) {
    try {
      const appointment = await this.getAppointment(appointmentId);

      await callPatient(appointment, appointment.consultingRoom);

      return { success: true };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  private async saveTransaction(patient: Patient, hmo, service: Service, serviceCost: ServiceCost, createdBy, appointment) {
    const amount = serviceCost?.tariff || 0;

    const data: TransactionCreditDto = {
      patient_id: patient.id,
      username: createdBy,
      sub_total: 0,
      vat: 0,
      amount: amount * -1,
      voucher_amount: 0,
      amount_paid: 0,
      change: 0,
      description: service.name,
      payment_method: null,
      part_payment_expiry_date: null,
      bill_source: service.category.name,
      next_location: 'vitals',
      status: 0,
      hmo_approval_code: null,
      transaction_details: null,
      admission_id: null,
      nicu_id: null,
      staff_id: null,
      lastChangedBy: null,
    };

    return await postDebit(data, serviceCost, null, null, appointment, hmo);
  }

  // private isWithinGracePeriod(lastVisit, gracePeriod) {
  // 	return lastVisit.isAfter(gracePeriod);
  // }

  // private async verifyGracePeriod(gracePeriodParams, patient_id, service_id) {
  // 	// find patient last appointment
  // 	const appointments = await this.appointmentRepository
  // 		.createQueryBuilder('appointment')
  // 		.where('appointment.patient_id = :patient_id', { patient_id })
  // 		.andWhere('appointment.service_cost_id = :service_id', { service_id })
  // 		.select(['appointment.createdAt as created_at'])
  // 		.orderBy('appointment.createdAt', 'DESC')
  // 		.limit(gracePeriodParams[0])
  // 		.getRawMany();
  // 	let result = true;
  // 	if (appointments.length) {
  // 		for (const {} of appointments) {
  // 			const lastVisit = moment(appointments[0].created_at);
  // 			const gracePeriod = moment().subtract(gracePeriodParams[0], gracePeriodParams[1]).startOf('day');
  // 			if (!this.isWithinGracePeriod(lastVisit, gracePeriod)) {
  // 				result = false;
  // 				return;
  // 			}
  // 		}
  // 	}
  // 	return result;
  // }

  private async verifyNoOfVisits(noOfVisits, patient_id, service_id) {
    const appointments = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .where('appointment.patient_id = :patient_id', { patient_id })
      .andWhere('appointment.service_cost_id = :service_id', { service_id })
      .select(['appointment.createdAt as created_at'])
      .orderBy('appointment.createdAt', 'DESC')
      .limit(noOfVisits)
      .getRawMany();

    if (appointments.length < noOfVisits) {
      return true;
    } else {
      return false;
    }
  }

  async filterConsultations(data) {
    try {
      const { clinic, month, year, doctor_id } = data;

      const page = parseInt(data.page) - 1;
      const limit = parseInt(data.limit);
      const offset = page * limit;

      let startDate: string;
      let endDate: string;

      const query = this.appointmentRepository
        .createQueryBuilder('q')
        .leftJoinAndSelect('q.department', 'department')
        .leftJoinAndSelect('q.whomToSee', 'doctor')
        .where('q.status = :status', { status: 'Completed' });

      if (clinic && clinic !== '') {
        query.andWhere('department.name iLike :name', { name: `%${clinic}%` });
      }

      if (month && year && month !== '' && year !== '') {
        startDate = `${year}-${month}-01 00:00:00`;
        endDate = `${year}-${month}-31 23:59:59`;
        query
          .andWhere('q.appointment_date > :startDate', { startDate })
          .andWhere('q.appointment_date < :endDate', { endDate });
      }

      if (doctor_id && doctor_id !== '') {
        query.andWhere('doctor.id = :doctor_id', { doctor_id });
      }

      const total = await query.getCount();

      const results = await query.orderBy('q.updated_at', 'DESC').take(limit).skip(offset).getMany();

      return {
        success: true,
        result: results,
        lastPage: Math.ceil(total / limit),
        itemsPerPage: limit,
        totalItems: total,
        currentPage: data.page,
      };
    } catch (error) {
      return { success: false, message: error.message || 'could not fetch' };
    }
  }
}
