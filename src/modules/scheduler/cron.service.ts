import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable, Logger } from '@nestjs/common';
import { getConnection, MoreThan } from 'typeorm';
import { Patient } from '../patient/entities/patient.entity';
import * as moment from 'moment';
import { Transaction } from '../finance/transactions/transaction.entity';
import { Admission } from '../patient/admissions/entities/admission.entity';
import { HmoScheme } from '../hmo/entities/hmo_scheme.entity';
import { ServiceCost } from '../settings/entities/service_cost.entity';
import { Nicu } from '../patient/nicu/entities/nicu.entity';
import { TransactionCreditDto } from '../finance/transactions/dto/transaction-credit.dto';
import { postDebit } from '../../common/utils/utils';
import { Appointment } from '../frontdesk/appointment/appointment.entity';
import * as ZKLib from 'zklib-js';
import { config } from 'dotenv';
import { InjectRepository } from '@nestjs/typeorm';
import { AttendanceRepository } from '../hr/attendance/attendance.repository';
import { Attendance } from '../hr/attendance/entities/attendance.entity';
config();
const port = process.env.BIO_PORT;
const ip = process.env.BIO_IP;
const zkInstance = new ZKLib(ip, parseInt(port), 5200, 5000);

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(AttendanceRepository)
    private attendanceRepository: AttendanceRepository,
  ) {}

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
              const count = await getConnection().getRepository(Transaction).count({ admission: item, bill_source: 'ward' });

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

  // save to emr database and erase records from biometric device local database;
  // this was made to run once a day because without logs, it crashes the server;
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async saveAttendanceToDB() {
    this.logger.debug('saving attendance to database');
    try {
      // Create socket to machine
      await zkInstance.createSocket();

      // Get general info like logCapacity, user counts, logs count
      // It's really useful to check the status of device

      console.log(await zkInstance.getInfo());
      await zkInstance
        .getAttendances()
        .then(async (logs) => {
          if (!logs) {
            console.log({
              success: false,
              message: 'no data in logs or bio-devive not connected to network',
            });
            return;
          }
          const attendanceArr = await logs.data;
          console.log(await logs.data);
          let dataArr = [];
          for (const item of await attendanceArr) {
            dataArr = [
              {
                staff: item.deviceUserId,
                ip: item.ip,
                date: item.recordTime,
                userDeviceId: item.userSn,
              },
              ...dataArr,
            ];
          }
          const rs = await this.attendanceRepository
            .createQueryBuilder()
            .insert()
            .into(Attendance)
            .values(dataArr)
            .execute();

          zkInstance.clearAttendanceLog();
          console.log({
            success: true,
            message: 'attendance saved to database',
            rs,
          });
          await zkInstance.disconnect();
          return;
        })
        .catch((error) => {
          console.log('error', error);
          return;
        });
    } catch (error) {
      console.log({ success: false, error });
      return;
    }
  }
}
