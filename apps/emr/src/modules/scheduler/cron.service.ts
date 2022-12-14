import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable, Logger } from '@nestjs/common';
import { getConnection, MoreThan } from 'typeorm';
import { Patient } from '../patient/entities/patient.entity';
import * as moment from 'moment';
import { Transaction } from '../finance/transactions/entities/transaction.entity';
import { Admission } from '../patient/admissions/entities/admission.entity';
import { HmoScheme } from '../hmo/entities/hmo_scheme.entity';
import { ServiceCost } from '../settings/entities/service_cost.entity';
import { Nicu } from '../patient/nicu/entities/nicu.entity';
import { TransactionCreditDto } from '../finance/transactions/dto/transaction-credit.dto';
import { backupDatabase, postDebit } from '../../common/utils/utils';
import { Appointment } from '../frontdesk/appointment/appointment.entity';
import { AttendanceService } from '../hr/attendance/attendance.service';
import { QueueService } from '../queue/queue.service';
import * as startCase from 'lodash.startcase';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private attendanceService: AttendanceService, private queueService: QueueService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async runEveryHour() {
    this.logger.debug('remove credit limits');
    try {
      const patients = await getConnection()
        .getRepository(Patient)
        .find({
          where: { credit_limit: MoreThan(0) },
        });

      for (const patient of patients) {
        const expiryDate = moment(patient.credit_limit_expiry_date, 'YYYY-MM-DD');
        if (moment().isSameOrAfter(expiryDate, 'day')) {
          await getConnection()
            .createQueryBuilder()
            .update(Patient)
            .set({ credit_limit: 0, credit_limit_expiry_date: null })
            .where('id = :id', { id: patient.id })
            .execute();
        }
      }
    } catch (e) {
      this.logger.error(e);
    }

    this.logger.debug('change part payments to pay now');
    try {
      const transactions = await getConnection()
        .getRepository(Transaction)
        .find({
          where: { status: -1 },
        });

      for (const item of transactions) {
        const expiryDate = moment(item.part_payment_expiry_date, 'YYYY-MM-DD');
        if (moment().isSameOrAfter(expiryDate, 'day')) {
          await getConnection()
            .createQueryBuilder()
            .update(Transaction)
            .set({ status: 0, part_payment_expiry_date: null })
            .where('id = :id', { id: item.id })
            .execute();
        }
      }
    } catch (e) {
      this.logger.error(e);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  async runEveryDayAtNoon() {
    try {
      this.logger.debug('add new payment for room');

      const admissions = await getConnection()
        .getRepository(Admission)
        .find({
          where: { status: 0 },
        });

      for (const item of admissions) {
        if (item.room_assigned_at && item.room_assigned_at !== '') {
          const roomAssignedAt = moment(item.room_assigned_at);
          if (moment().isAfter(roomAssignedAt, 'day')) {
            const transaction = await getConnection()
              .getRepository(Transaction)
              .createQueryBuilder('t')
              .select('t.*')
              .andWhere('t.bill_source = :source', { source: 'ward' })
              .andWhere('t.admission_id = :id', { id: item.id })
              .getRawOne();

            if (transaction) {
              const count = await getConnection().getRepository(Transaction).count({
                admission: item,
                bill_source: 'ward',
              });

              const service = await getConnection().getRepository(ServiceCost).findOne(transaction.service_cost_id);
              const hmo = await getConnection().getRepository(HmoScheme).findOne(transaction.hmo_scheme_id);

              const data: TransactionCreditDto = {
                patient_id: transaction.patient_id,
                username: transaction.createdBy,
                sub_total: 0,
                vat: 0,
                amount: transaction.amount * -1,
                voucher_amount: 0,
                amount_paid: 0,
                change: 0,
                description: `${transaction.description.split(' - ')[0]} - Day ${count + 1}`,
                payment_method: null,
                part_payment_expiry_date: null,
                bill_source: 'ward',
                next_location: null,
                status: -1,
                hmo_approval_code: null,
                transaction_details: null,
                admission_id: item.id,
                nicu_id: null,
                staff_id: null,
                lastChangedBy: null,
              };

              await postDebit(data, service, null, null, null, hmo);
            }
          }
        }
      }
    } catch (e) {
      this.logger.error(e);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  async runEveryDayAtNoonNicu() {
    try {
      this.logger.debug('ass new payment for accommodation');

      const nicuAdmissions = await getConnection()
        .getRepository(Nicu)
        .find({
          where: { status: 0 },
        });

      for (const item of nicuAdmissions) {
        if (item.accommodation_assigned_at && item.accommodation_assigned_at !== '') {
          const accommodationAssignedAt = moment(item.accommodation_assigned_at);
          if (moment().isAfter(accommodationAssignedAt, 'day')) {
            const transaction = await getConnection()
              .getRepository(Transaction)
              .createQueryBuilder('t')
              .select('t.*')
              .andWhere('t.bill_source = :source', { source: 'nicu-accommodation' })
              .andWhere('t.nicu_id = :id', { id: item.id })
              .getRawOne();

            if (transaction) {
              const count = await getConnection()
                .getRepository(Transaction)
                .count({ nicu: item, bill_source: 'nicu-accommodation' });

              const service = await getConnection().getRepository(ServiceCost).findOne(transaction.service_cost_id);
              const hmo = await getConnection().getRepository(HmoScheme).findOne(transaction.hmo_scheme_id);

              const data: TransactionCreditDto = {
                patient_id: transaction.patient_id,
                username: transaction.createdBy,
                sub_total: 0,
                vat: 0,
                amount: transaction.amount * -1,
                voucher_amount: 0,
                amount_paid: 0,
                change: 0,
                description: `${transaction.description.split(' - ')[0]} - Day ${count + 1}`,
                payment_method: null,
                part_payment_expiry_date: null,
                bill_source: 'nicu-accommodation',
                next_location: null,
                status: -1,
                hmo_approval_code: null,
                transaction_details: null,
                admission_id: null,
                nicu_id: item.id,
                staff_id: null,
                lastChangedBy: null,
              };

              await postDebit(data, service, null, null, null, hmo);
            }
          }
        }
      }
    } catch (e) {
      this.logger.error(e);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async removeMissedAppointment() {
    this.logger.debug('remove missed appointment');
    try {
      const appointments = await getConnection()
        .getRepository(Appointment)
        .find({
          where: { status: 'Pending Paypoint Approval' },
        });

      for (const item of appointments) {
        if (moment().isAfter(item.appointment_date, 'day')) {
          const transaction = await getConnection()
            .getRepository(Transaction)
            .createQueryBuilder('t')
            .select('t.*')
            .andWhere('t.bill_source = :source', { source: 'consultancy' })
            .andWhere('t.appointment_id = :appointment', { appointment: item.id })
            .getRawOne();

          if (transaction) {
            const appTransact = await getConnection().getRepository(Transaction).findOne(transaction.id);
            appTransact.deletedBy = 'admin';
            await appTransact.save();
            await appTransact.softRemove();
          }

          const single = await getConnection().getRepository(Appointment).findOne(item.id);
          single.status = 'Missed';
          await single.save();
        }
      }
    } catch (e) {
      this.logger.error(e);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async saveAttendanceToDB() {
    try {
      this.logger.debug('saving attendance to database');
      await this.attendanceService.saveAttendance();
      this.logger.debug('logs saved to database');
    } catch (error) {
      console.log({ success: false, error });
      return;
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async backupDb() {
    try {
      this.logger.debug('backing up database');
      await backupDatabase();
    } catch (error) {
      console.log({ success: false, error });
      return;
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_8PM)
  async sendAppointmentReminder() {
    try {
      this.logger.debug('sending appointment reminders');

      const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');

      const appointments = await getConnection()
        .getRepository(Appointment)
        .createQueryBuilder('q')
        .leftJoinAndSelect('q.patient', 'patient')
        .leftJoinAndSelect('q.whomToSee', 'whomToSee')
        .where(`CAST(q.appointment_date as text) LIKE '%${tomorrow}%'`)
        .getMany();

      if (appointments) {
        appointments.forEach(async (appointment) => {
          const name = `${startCase(appointment.patient.surname)} ${startCase(appointment.patient.other_names)}`;
          const doctor = `${startCase(appointment.whomToSee?.first_name) || ''} ${
            startCase(appointment.whomToSee?.last_name) || ''
          }`;
          const time = moment(appointment.appointment_date).format('hh:mm A');

          const mail = {
            name,
            doctor,
            time,
            patientId: appointment.patient.id,
            date: moment().format('YYYY-MM-DD'),
            email: appointment.patient.email,
            phoneNumber: appointment.patient.phone_number,
            message: `Dear ${name}, this is to remind you that your appointment with Dr. ${doctor} is scheduled for ${time} tomorrow. Thank you.`,
          };

          try {
            await this.queueService.queueJob('appointment', mail);
          } catch (error) {
            console.log(error);
          }
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
}
