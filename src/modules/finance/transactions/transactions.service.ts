import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionsRepository } from './transactions.repository';
import * as moment from 'moment';
import { PatientRepository } from '../../patient/repositories/patient.repository';
import { ProcessTransactionDto } from './dto/process-transaction.dto';
import { VoucherRepository } from '../vouchers/voucher.repository';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { QueueSystemRepository } from '../../frontdesk/queue-system/queue-system.repository';
import { AppointmentRepository } from '../../frontdesk/appointment/appointment.repository';
import { AppGateway } from '../../../app.gateway';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { Brackets, getConnection, getRepository, Like } from 'typeorm';
import {
  createServiceCost,
  getDepositBalance,
  getSerialCode,
  getStaff,
  postCredit,
  postDebit,
  formatPID,
  generatePDF,
  formatCurrency,
  parseSource,
  formatPatientId,
  parseDescriptionB,
  staffname,
} from '../../../common/utils/utils';
import { Settings } from '../../settings/entities/settings.entity';
import { ServiceCostRepository } from '../../settings/services/repositories/service_cost.repository';
import { HmoSchemeRepository } from '../../hmo/repositories/hmo_scheme.repository';
import { PatientRequestItemRepository } from '../../patient/repositories/patient_request_items.repository';
import { TransactionCreditDto } from './dto/transaction-credit.dto';
import { AccountDeposit } from './entities/deposit.entity';
import { Transaction } from './entities/transaction.entity';
import { Admission } from '../../patient/admissions/entities/admission.entity';
import { Nicu } from '../../patient/nicu/entities/nicu.entity';
import { Queue } from 'src/modules/frontdesk/queue-system/queue.entity';
import { PatientRequestRepository } from '../../patient/repositories/patient_request.repository';
import { ServiceCost } from '../../settings/entities/service_cost.entity';
import { PatientRequestItem } from '../../patient/entities/patient_request_items.entity';
import { AdmissionsRepository } from '../../patient/admissions/repositories/admissions.repository';
import * as path from 'path';
import { ServiceCategoryRepository } from '../../settings/services/repositories/service_category.repository';
import { TransactionSearchDto } from './dto/search.dto';
import { StaffRepository } from 'src/modules/hr/staff/staff.repository';
import { OrderRepository } from '../../cafeteria/repositories/order.repository';
import * as startCase from 'lodash.startcase';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(AppointmentRepository)
    private appointmentRepository: AppointmentRepository,
    @InjectRepository(TransactionsRepository)
    private transactionsRepository: TransactionsRepository,
    @InjectRepository(PatientRepository)
    private patientRepository: PatientRepository,
    @InjectRepository(ServiceCostRepository)
    private serviceCostRepository: ServiceCostRepository,
    @InjectRepository(VoucherRepository)
    private voucherRepository: VoucherRepository,
    @InjectRepository(HmoSchemeRepository)
    private hmoSchemeRepository: HmoSchemeRepository,
    @InjectRepository(QueueSystemRepository)
    private queueSystemRepository: QueueSystemRepository,
    @InjectRepository(PatientRequestItemRepository)
    private patientRequestItemRepository: PatientRequestItemRepository,
    @InjectRepository(PatientRequestRepository)
    private patientRequestRepository: PatientRequestRepository,
    @InjectRepository(AdmissionsRepository)
    private admissionRepository: AdmissionsRepository,
    @InjectRepository(ServiceCategoryRepository)
    private serviceCategoryRepository: ServiceCategoryRepository,
    private readonly appGateway: AppGateway,
    @InjectRepository(StaffRepository)
    private staffRepository: StaffRepository,
    @InjectRepository(OrderRepository)
    private orderRepository: OrderRepository,
  ) { }

  async fetchList(options: PaginationOptionsInterface, params): Promise<Pagination> {
    const { startDate, endDate, patient_id, staff_id, service_id, status } = params;

    const page = options.page - 1;

    const query = this.transactionsRepository
      .createQueryBuilder('q')
      .select('q.*')
      .where('q.payment_type = :type', { type: 'self' });

    if (service_id && service_id !== '') {
      let bill_source = '';

      if (service_id === 'credit') {
        bill_source = 'credit-deposit';
      } else if (service_id === 'transfer') {
        bill_source = 'credit-transfer';
      } else if (service_id === 'cafeteria') {
        bill_source = 'cafeteria';
      } else {
        const serviceCategory = await this.serviceCategoryRepository.findOne(service_id);
        bill_source = serviceCategory?.slug || '';
      }

      if (bill_source && bill_source !== '') {
        query.andWhere('q.bill_source = :bill_source', { bill_source });
      }
    }

    if (startDate && startDate !== '' && endDate && endDate !== '' && endDate === startDate) {
      query.andWhere(`DATE(q.createdAt) = '${startDate}'`);
    } else {
      if (startDate && startDate !== '') {
        const start = moment(startDate).endOf('day').toISOString();
        query.andWhere(`q.createdAt >= '${start}'`);
      }
      if (endDate && endDate !== '') {
        const end = moment(endDate).endOf('day').toISOString();
        query.andWhere(`q.createdAt <= '${end}'`);
      }
    }

    if (patient_id && patient_id !== '') {
      query.andWhere('q.patient_id = :patient_id', { patient_id });
    }

    if (staff_id && staff_id !== '') {
      query.andWhere('q.staff_id = :staff_id', { staff_id });
    }

    if (status && status !== '') {
      if (status === 1) {
        query.andWhere('q.status = :status', { status: 1 });
      } else {
        query.andWhere(
          new Brackets((qb) => {
            qb.where('q.status = :status', { status: 0 }).orWhere('q.status = :status', { status: -1 });
          }),
        );
      }
    }

    const transactions = await query
      .offset(page * options.limit)
      .limit(options.limit)
      .orderBy('q.createdAt', 'DESC')
      .getRawMany();

    const total = await query.getCount();

    for (const transaction of transactions) {
      transaction.hmo = await this.hmoSchemeRepository.findOne(transaction.hmo_scheme_id);

      transaction.staff = await getStaff(transaction.lastChangedBy);

      if (transaction.patient_id) {
        transaction.patient = await this.patientRepository.findOne(transaction.patient_id, {
          relations: ['nextOfKin', 'immunization', 'hmo'],
        });
      }

      if (transaction.service_cost_id) {
        transaction.service = await this.serviceCostRepository.findOne(transaction.service_cost_id);
      }

      if (transaction.patient_request_item_id) {
        transaction.patientRequestItem = await this.patientRequestItemRepository.findOne(
          transaction.patient_request_item_id,
          { relations: ['request'] },
        );
      }

      transaction.admission = transaction.admission_id
        ? await this.admissionRepository.findOne(transaction.admission_id, {
          relations: ['room', 'room.category'],
        })
        : null;

      transaction.cashier = await getStaff(transaction.createdBy);

      transaction.appointment = await this.appointmentRepository.findOne({
        where: { transaction: transaction.id },
      });

      if (transaction.staff_id) {
        transaction.dedastaff = await this.staffRepository.findOne(transaction.staff_id);
      }
    }

    return {
      result: transactions,
      lastPage: Math.ceil(total / options.limit),
      itemsPerPage: options.limit,
      totalPages: total,
      currentPage: options.page,
    };
  }

  async fetchPending(options: PaginationOptionsInterface, params): Promise<any> {
    const { startDate, endDate, patient_id, service_id, fetch } = params;

    const query = this.transactionsRepository
      .createQueryBuilder('q')
      .select('q.*')
      .where('q.payment_type = :type', { type: 'self' });

    query.where(
      new Brackets((qb) => {
        qb.where('q.status = 0').orWhere('q.status = -1');
      }),
    );

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

    if (service_id && service_id !== '') {
      let bill_source = '';

      if (service_id === 'credit') {
        bill_source = 'credit-deposit';
      } else if (service_id === 'transfer') {
        bill_source = 'credit-transfer';
      } else if (service_id === 'cafeteria') {
        bill_source = 'cafeteria';
      } else if (service_id === 'drugs') {
        bill_source = 'drugs';
      } else {
        const serviceCategory = await this.serviceCategoryRepository.findOne(service_id);
        bill_source = serviceCategory?.slug || '';
      }

      if (bill_source && bill_source !== '') {
        query.andWhere('q.bill_source = :bill_source', { bill_source });
      }
    }

    const allTransactions = fetch && fetch === '1' ? await query.getRawMany() : [];

    const page = options.page - 1;

    const transactions = await query
      .offset(page * options.limit)
      .limit(options.limit)
      .orderBy('q.createdAt', 'DESC')
      .getRawMany();

    const total = await query.getCount();

    for (const transaction of transactions) {
      if (transaction.patient_id) {
        transaction.patient = await this.patientRepository.findOne(transaction.patient_id);
      }

      if (transaction.service_cost_id) {
        transaction.service = await this.serviceCostRepository.findOne(transaction.service_cost_id);
      }

      if (transaction.patient_request_item_id) {
        transaction.patientRequestItem = await this.patientRequestItemRepository.findOne(
          transaction.patient_request_item_id,
          { relations: ['request'] },
        );
      }

      transaction.admission = transaction.admission_id
        ? await this.admissionRepository.findOne(transaction.admission_id, {
          relations: ['room', 'room.category'],
        })
        : null;

      transaction.cashier = await getStaff(transaction.createdBy);

      transaction.appointment = await this.appointmentRepository.findOne({
        where: { transaction: transaction.id },
      });

      if (transaction.staff_id) {
        transaction.dedastaff = await this.staffRepository.findOne(transaction.staff_id);
      }
    }

    return {
      result: transactions,
      lastPage: Math.ceil(total / options.limit),
      itemsPerPage: options.limit,
      totalPages: total,
      currentPage: options.page,
      all: allTransactions.map((t) => ({ id: t.id, amount: t.amount })),
    };
  }

  async getPaidTransactionsByBillSource(urlParams): Promise<any> {
    try {
      const { bill_source } = urlParams;

      const transactions = await this.transactionsRepository.find({
        where: { bill_source, status: 1 },
      });

      const fill_quantity = transactions.reduce((total, item) => total + item.patientRequestItem.fill_quantity, 0);
      const total_price = transactions.reduce((total, item) => total + item.amount_paid, 0);

      const transaction = {
        bill_source,
        fill_quantity,
        total_price,
        total_transactions: transactions.length,
        status: 'paid',
      };

      return { success: true, transaction };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message };
    }
  }

  async saveRequest(params: any, username: string): Promise<any> {
    try {
      const { patient_id, items } = params;

      const patient = await this.patientRepository.findOne(patient_id, {
        relations: ['hmo'],
      });

      let transactions = [];
      for (const item of items) {
        if (item.code && item.code !== '') {
          const serialCode = await getSerialCode(item.category);
          const nextId = `00000${serialCode}`;
          const code = `${item.category.toUpperCase().substring(0, 1)}R${moment().format('YY')}/${moment().format(
            'MM',
          )}/${nextId.slice(-5)}`;

          const hmo = patient.hmo;

          const data = {
            code,
            serial_code: serialCode,
            patient,
            requestType: item.category,
            requestNote: '',
            urgent: false,
            createdBy: username,
          };

          const request = await this.patientRequestRepository.save(data);

          let serviceCost = await getConnection()
            .getRepository(ServiceCost)
            .findOne({
              where: { code: item.code, hmo },
            });
          if (!serviceCost) {
            serviceCost = await createServiceCost(item.code, hmo);
          }

          const _requestItem = {
            request,
            service: serviceCost.item,
            createdBy: username,
          };
          const requestItem = await this.patientRequestItemRepository.save(_requestItem);

          const transactionCreditDto: TransactionCreditDto = {
            patient_id: patient.id,
            username,
            sub_total: 0,
            vat: 0,
            amount: (serviceCost?.tariff || 0) * -1,
            voucher_amount: 0,
            amount_paid: 0,
            change: 0,
            description: `Payment for ${item.category}`,
            payment_method: null,
            part_payment_expiry_date: null,
            bill_source: item.category,
            next_location: null,
            status: 0,
            hmo_approval_code: null,
            transaction_details: null,
            admission_id: null,
            nicu_id: null,
            staff_id: null,
            lastChangedBy: null,
          };

          const payment = await postDebit(transactionCreditDto, serviceCost, null, requestItem, null, hmo);

          const rqItem = await getConnection().getRepository(PatientRequestItem).findOne(requestItem.id);
          rqItem.transaction = await getConnection().getRepository(Transaction).findOne(payment.id);
          await rqItem.save();

          transactions = [...transactions, payment];
        }
      }

      return { success: true, transactions };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message };
    }
  }

  async processTransaction(id: number, transactionDto: ProcessTransactionDto, username): Promise<any> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.startTransaction();

    const { voucher_id, amount_paid, voucher_amount, payment_method, patient_id } = transactionDto;
    try {
      const transaction = await this.transactionsRepository.findOne(id, {
        relations: ['patient', 'staff', 'appointment', 'hmo', 'admission', 'nicu'],
      });

      if (transaction.status === 1) {
        return {
          success: false,
          message: 'payment has already been processed.',
        };
      }

      const amount = Math.abs(transaction.amount);

      const balance_amount = amount_paid - amount;
      console.log(`balance: ${balance_amount}, amount paid: ${amount_paid}, transaction amount: ${amount}`);

      let data: TransactionCreditDto = {
        patient_id,
        username,
        sub_total: 0,
        vat: 0,
        amount: Math.abs(amount),
        voucher_amount: 0,
        amount_paid,
        change: 0,
        description: transaction.description,
        payment_method,
        part_payment_expiry_date: null,
        bill_source: transaction.bill_source,
        next_location: null,
        status: 1,
        hmo_approval_code: null,
        transaction_details: transaction.transaction_details,
        admission_id: transaction.admission?.id || null,
        nicu_id: transaction.nicu?.id || null,
        staff_id: transaction.staff?.id || null,
        lastChangedBy: username,
      };

      let voucher = null;
      if (payment_method === 'Voucher') {
        voucher = await this.voucherRepository.findOne(voucher_id, {
          relations: ['patient'],
        });

        if (voucher.patient.id !== patient_id) {
          return { success: false, message: 'invalid voucher code' };
        } else if (!voucher.isActive) {
          return { success: false, message: 'voucher code has been used' };
        }

        data = { ...data, voucher_amount };

        voucher.amount_used = voucher_amount;
        voucher.isActive = false;
        await voucher.save();
      }

      let queue: Queue;
      let appointment = null;
      if (transaction.next_location && transaction.next_location === 'vitals') {
        // find appointment
        console.log(transaction.id);
        appointment = await this.appointmentRepository.findOne({
          where: { transaction: transaction.id },
          relations: ['patient', 'whomToSee', 'consultingRoom', 'serviceCategory'],
        });

        if (!appointment) {
          return { success: false, message: 'Cannot find appointment' };
        }

        appointment.status = 'Approved';
        appointment.save();
        console.log(appointment);

        // create new queue
        queue = await this.queueSystemRepository.saveQueue(appointment, transaction.next_location, appointment.patient);
        this.appGateway.server.emit('nursing-queue', { queue });
      }

      // approve debit
      transaction.next_location = null;
      transaction.status = 1;
      transaction.lastChangedBy = username;
      transaction.amount_paid = Math.abs(amount_paid);
      transaction.payment_method = payment_method;
      const rs = await transaction.save();

      const credit = await postCredit(
        data,
        transaction.service,
        voucher,
        transaction.patientRequestItem,
        appointment,
        transaction.hmo,
      );

      if (transaction.bill_source === 'cafeteria') {
        for (const item of transaction.transaction_details) {
          const order = await this.orderRepository.findOne(item.id);
          order.transaction = credit;
          order.status = 2;
          await order.save();
        }
      }

      let balancePayment: Transaction;
      let balance = 0;
      if (balance_amount > 0) {
        // save excess amount as credit
        balance = await this.addCredit(transaction.patient, balance_amount, 'Credit Balance', username, null);
      } else if (balance_amount < 0) {
        // create debit transaction
        const duration = await getConnection()
          .getRepository(Settings)
          .findOne({ where: { slug: 'part-payment-duration' } });
        const date = transaction.admission ? null : moment().add(duration.value, 'd').format('YYYY-MM-DD');

        const value: TransactionCreditDto = {
          patient_id: transaction.patient?.id || null,
          username,
          sub_total: 0,
          vat: 0,
          amount: Math.abs(balance_amount) * -1,
          voucher_amount: 0,
          amount_paid: 0,
          change: 0,
          description: transaction.description,
          payment_method: null,
          part_payment_expiry_date: date,
          bill_source: transaction.bill_source,
          next_location: transaction.next_location,
          status: -1,
          hmo_approval_code: transaction.hmo_approval_code,
          transaction_details: transaction.transaction_details,
          admission_id: transaction.admission?.id || null,
          nicu_id: transaction.nicu?.id || null,
          staff_id: transaction.staff?.id || null,
          lastChangedBy: username,
        };

        balancePayment = await postDebit(
          value,
          transaction.service,
          null,
          transaction.patientRequestItem,
          transaction.appointment,
          transaction.hmo,
        );
      }

      await queryRunner.commitTransaction();
      await queryRunner.release();

      const creditTransaction = await this.transactionsRepository.findOne(credit.id, {
        relations: ['patient', 'staff', 'appointment', 'hmo', 'admission', 'patientRequestItem'],
      });
      const cashier = await getStaff(credit.createdBy);
      if (creditTransaction.patientRequestItem) {
        transaction.patientRequestItem = await this.patientRequestItemRepository.findOne(transaction.patientRequestItem.id, {
          relations: ['request'],
        });
      }

      rs.staff = await getStaff(transaction.lastChangedBy);

      return {
        success: true,
        transaction: rs,
        credit: { ...creditTransaction, cashier },
        queue,
        balancePayment,
        balance,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      console.log(error);
      return { success: false, message: error.message };
    }
  }

  async skipPaymentToQueue(id: number, transactionDto: ProcessTransactionDto, username: string): Promise<any> {
    const { patient_id } = transactionDto;
    try {
      const transaction = await this.transactionsRepository.findOne(id);

      let queue: Queue;
      let appointment = null;
      if (transaction.next_location && transaction.next_location === 'vitals') {
        // find appointment
        console.log(transaction.id);
        appointment = await this.appointmentRepository.findOne({
          where: { transaction: transaction.id },
          relations: ['patient', 'whomToSee', 'consultingRoom', 'serviceCategory'],
        });

        if (!appointment) {
          return { success: false, message: 'Cannot find appointment' };
        }

        appointment.status = 'Approved';
        appointment.save();
        console.log(appointment);

        // create new queue
        queue = await this.queueSystemRepository.saveQueue(appointment, transaction.next_location, appointment.patient);
        this.appGateway.server.emit('nursing-queue', { queue });

        const expiry_date = moment().add(7, 'days').format('YYYY-MM-DD');

        const patient = await this.patientRepository.findOne(patient_id);
        patient.credit_limit = 2000000;
        patient.credit_limit_expiry_date = expiry_date;
        patient.lastChangedBy = username;
        await patient.save();
      }

      return { success: true, appointment };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message };
    }
  }

  async processBulkTransaction(transactionDto: ProcessTransactionDto, username: string): Promise<any> {
    const { payment_method, items, patient_id, amount_paid } = transactionDto;
    try {
      let transactions = [];
      let total = 0;
      for (const item of items) {
        const transaction = await this.transactionsRepository.findOne(item.id, {
          relations: ['patient', 'staff', 'appointment', 'hmo', 'admission', 'nicu'],
        });

        total = total + Math.abs(item.amount);

        const data: TransactionCreditDto = {
          patient_id: transaction.patient.id,
          username,
          sub_total: 0,
          vat: 0,
          amount: Math.abs(item.amount),
          voucher_amount: 0,
          amount_paid: Math.abs(item.amount),
          change: 0,
          description: transaction.description,
          payment_method,
          part_payment_expiry_date: null,
          bill_source: transaction.bill_source,
          next_location: null,
          status: 1,
          hmo_approval_code: null,
          transaction_details: null,
          admission_id: transaction.admission?.id || null,
          nicu_id: transaction.nicu?.id || null,
          staff_id: transaction.staff?.id || null,
          lastChangedBy: username,
        };

        let queue: Queue;
        let appointment = null;
        if (transaction.next_location && transaction.next_location === 'vitals') {
          // find appointment
          appointment = await this.appointmentRepository.findOne({
            where: { transaction: transaction.id },
            relations: ['patient', 'whomToSee', 'consultingRoom', 'serviceCategory'],
          });

          // create new queue
          if (appointment) {
            appointment.status = 'Approved';
            appointment.save();

            queue = await this.queueSystemRepository.saveQueue(appointment, transaction.next_location);
            this.appGateway.server.emit('nursing-queue', { queue });
          }
        }

        await postCredit(data, transaction.service, null, transaction.patientRequestItem, appointment, transaction.hmo);

        transaction.next_location = null;
        transaction.status = 1;
        transaction.lastChangedBy = username;
        transaction.amount_paid = Math.abs(item.amount);
        const rs = await transaction.save();

        rs.staff = await getStaff(transaction.lastChangedBy);

        transactions = [...transactions, rs];
      }

      const patient = await this.patientRepository.findOne(patient_id, {
        relations: ['staff'],
      });

      const admission = await getConnection()
        .getRepository(Admission)
        .findOne({
          where: { patient, status: 0 },
        });

      const nicu = await getConnection()
        .getRepository(Nicu)
        .findOne({
          where: { patient, status: 0 },
        });

      const balance_amount = amount_paid - total;
      console.log(`balance: ${balance_amount}, amount paid: ${amount_paid}, transaction amount: ${total}`);

      let balancePayment: Transaction;
      let balance = 0;
      if (balance_amount > 0) {
        // save excess amount as credit
        balance = await this.addCredit(patient, balance_amount, 'Credit Balance', username, null);
      } else if (balance_amount < 0) {
        // create debit transaction
        const duration = await getConnection()
          .getRepository(Settings)
          .findOne({ where: { slug: 'part-payment-duration' } });
        const date = admission ? null : moment().add(duration.value, 'd').format('YYYY-MM-DD');

        const value: TransactionCreditDto = {
          patient_id: patient.id,
          username,
          sub_total: 0,
          vat: 0,
          amount: Math.abs(balance_amount) * -1,
          voucher_amount: 0,
          amount_paid: 0,
          change: 0,
          description: null,
          payment_method: null,
          part_payment_expiry_date: date,
          bill_source: 'debit',
          next_location: null,
          status: -1,
          hmo_approval_code: null,
          transaction_details: null,
          admission_id: admission?.id || null,
          nicu_id: nicu?.id || null,
          staff_id: patient.staff?.id || null,
          lastChangedBy: username,
        };

        balancePayment = await postDebit(value, null, null, null, null, patient.hmo);
      }

      return { success: true, transactions, balancePayment, balance };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message };
    }
  }

  async creditAccount(params, createdBy: string): Promise<any> {
    try {
      const { patient_id, amount, payment_method, description } = params;

      const patient = await this.patientRepository.findOne(patient_id, {
        relations: ['hmo'],
      });

      const balance = await this.addCredit(patient, amount, payment_method, createdBy, description);

      return { success: true, balance };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message };
    }
  }

  async debitAccount(params, createdBy: string): Promise<any> {
    try {
      const { patient_id, type, amount, description } = params;

      const patient = await this.patientRepository.findOne(patient_id, {
        relations: ['hmo'],
      });

      if (type === 'debit-charge') {
        const debitTransaction: TransactionCreditDto = {
          patient_id: patient.id,
          username: createdBy,
          sub_total: 0,
          vat: 0,
          amount: Math.abs(amount) * -1,
          voucher_amount: 0,
          amount_paid: 0,
          change: 0,
          description: description || 'debit account',
          payment_method: null,
          part_payment_expiry_date: null,
          bill_source: type,
          next_location: null,
          status: -1,
          hmo_approval_code: null,
          transaction_details: null,
          admission_id: null,
          nicu_id: null,
          staff_id: null,
          lastChangedBy: null,
        };

        const debit = await postDebit(debitTransaction, null, null, null, null, patient.hmo);

        return { success: true, data: debit };
      }

      return { success: true };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message };
    }
  }

  async transferCredit(params, username: string): Promise<any> {
    try {
      const { patient_id, amount, recipient_id } = params;

      const patient = await this.patientRepository.findOne(patient_id, {
        relations: ['hmo'],
      });

      const recipient = await this.patientRepository.findOne(recipient_id, {
        relations: ['hmo'],
      });

      const creditAmount = await getDepositBalance(patient.id, true);
      const balance = creditAmount - amount;

      if (balance < 0) {
        return {
          success: false,
          message: 'insufficient funds please credit account',
        };
      }

      const data: TransactionCreditDto = {
        patient_id: recipient.id,
        username,
        sub_total: 0,
        vat: 0,
        amount: Math.abs(amount),
        voucher_amount: 0,
        amount_paid: 0,
        change: 0,
        description: 'credit account',
        payment_method: 'Credit Transfer',
        part_payment_expiry_date: null,
        bill_source: 'credit-deposit',
        next_location: null,
        status: 1,
        hmo_approval_code: null,
        transaction_details: null,
        admission_id: null,
        nicu_id: null,
        staff_id: null,
        lastChangedBy: null,
      };

      const credit = await postCredit(data, null, null, null, null, recipient.hmo);

      await getConnection()
        .getRepository(AccountDeposit)
        .save({
          patient: recipient,
          amount: Math.abs(amount),
          transaction: credit,
        });

      const debitTransaction: TransactionCreditDto = {
        patient_id: patient.id,
        username,
        sub_total: 0,
        vat: 0,
        amount: Math.abs(amount) * -1,
        voucher_amount: 0,
        amount_paid: 0,
        change: 0,
        description: `Transfer credit to EMR ID: ${formatPatientId(recipient)}`,
        payment_method: 'Credit Transfer',
        part_payment_expiry_date: null,
        bill_source: 'credit-transfer',
        next_location: null,
        status: 1,
        hmo_approval_code: null,
        transaction_details: null,
        admission_id: null,
        nicu_id: null,
        staff_id: null,
        lastChangedBy: null,
      };

      const debit = await postDebit(debitTransaction, null, null, null, null, patient.hmo);

      await getConnection()
        .getRepository(AccountDeposit)
        .save({ patient, amount: Math.abs(amount) * -1, transaction: debit });

      return { success: true, balance };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message };
    }
  }

  async processCreditTransaction(transactionDto: ProcessTransactionDto, username): Promise<any> {
    const { payment_method, items } = transactionDto;
    try {
      let transactions = [];
      for (const item of items) {
        const transaction = await this.transactionsRepository.findOne(item.id, {
          relations: ['patient', 'staff', 'appointment', 'hmo', 'admission', 'nicu'],
        });

        const balance = await getDepositBalance(transaction.patient.id, true);
        const remaining = balance - Math.abs(item.amount);

        let payment_amount = Math.abs(item.amount);
        if (remaining < 0) {
          payment_amount = balance;

          const debit: TransactionCreditDto = {
            patient_id: transaction.patient.id,
            username,
            sub_total: transaction.sub_total,
            vat: transaction.vat,
            amount: remaining,
            voucher_amount: 0,
            amount_paid: 0,
            change: 0,
            description: transaction.description,
            payment_method: null,
            part_payment_expiry_date: null,
            bill_source: transaction.bill_source,
            next_location: transaction.next_location || null,
            status: -1,
            hmo_approval_code: null,
            transaction_details: transaction.transaction_details || null,
            admission_id: transaction.admission?.id || null,
            nicu_id: transaction.nicu?.id || null,
            staff_id: transaction.staff?.id || null,
            lastChangedBy: null,
          };

          await postDebit(debit, transaction.service, null, transaction.patientRequestItem, null, transaction.hmo);
        }

        const data: TransactionCreditDto = {
          patient_id: transaction.patient.id,
          username,
          sub_total: 0,
          vat: 0,
          amount: payment_amount,
          voucher_amount: 0,
          amount_paid: payment_amount,
          change: 0,
          description: transaction.description,
          payment_method,
          part_payment_expiry_date: null,
          bill_source: transaction.bill_source,
          next_location: null,
          status: 1,
          hmo_approval_code: null,
          transaction_details: null,
          admission_id: transaction.admission?.id || null,
          nicu_id: transaction.nicu?.id || null,
          staff_id: transaction.staff?.id || null,
          lastChangedBy: null,
        };

        let queue;
        let appointment = null;
        if (transaction.next_location && transaction.next_location === 'vitals') {
          // find appointment
          appointment = await this.appointmentRepository.findOne({
            where: { transaction: transaction.id },
            relations: ['patient', 'whomToSee', 'consultingRoom', 'serviceCategory'],
          });

          // create new queue
          if (appointment) {
            appointment.status = 'Approved';
            appointment.save();

            queue = await this.queueSystemRepository.saveQueue(appointment, transaction.next_location);
            this.appGateway.server.emit('nursing-queue', { queue });
          }
        }

        const credit = await postCredit(
          data,
          transaction.service,
          null,
          transaction.patientRequestItem,
          appointment,
          transaction.hmo,
        );

        await getConnection()
          .getRepository(AccountDeposit)
          .save({
            patient: transaction.patient,
            amount: Math.abs(payment_amount) * -1,
            transaction: credit,
          });

        transaction.amount = Math.abs(payment_amount) * -1;
        transaction.next_location = null;
        transaction.status = 1;
        transaction.lastChangedBy = username;
        const rs = await transaction.save();

        rs.staff = await getStaff(transaction.lastChangedBy);

        transactions = [...transactions, rs];
      }

      return { success: true, transactions };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message };
    }
  }

  async transfer(id: number, createdBy): Promise<any> {
    const transaction = await this.transactionsRepository.findOne(id);

    const hmo = await this.hmoSchemeRepository.findOne({
      where: { name: 'Private' },
    });

    const serviceCost = await this.serviceCostRepository.findOne({
      where: {
        code: transaction.service.code,
        hmo,
      },
    });

    transaction.payment_type = 'self';
    transaction.amount = serviceCost.tariff * -1;
    transaction.transaction_details = {
      ...transaction.transaction_details,
      amount: serviceCost.tariff,
    };
    transaction.hmo = hmo;
    transaction.lastChangedBy = createdBy;
    const rs = await transaction.save();

    return { success: true, transaction: rs };
  }

  async approve(id: number, createdBy): Promise<any> {
    const transaction = await this.transactionsRepository.findOne(id, {
      relations: ['patient', 'staff', 'appointment', 'hmo', 'admission', 'nicu'],
    });

    const appointment = await this.appointmentRepository.findOne({
      where: { transaction },
      relations: ['patient'],
    });
    if (appointment) {
      appointment.status = 'Approved';
      appointment.lastChangedBy = createdBy;
      await appointment.save();

      const queue = await this.queueSystemRepository.saveQueue(appointment, transaction.next_location, appointment.patient);
      this.appGateway.server.emit('nursing-queue', { queue });
    }

    const data: TransactionCreditDto = {
      patient_id: transaction.patient.id,
      username: createdBy,
      sub_total: 0,
      vat: 0,
      amount: Math.abs(transaction.amount),
      voucher_amount: 0,
      amount_paid: Math.abs(transaction.amount),
      change: 0,
      description: transaction.description,
      payment_method: 'HMO',
      part_payment_expiry_date: null,
      bill_source: transaction.bill_source,
      next_location: null,
      status: 1,
      hmo_approval_code: null,
      transaction_details: null,
      admission_id: transaction.admission?.id || null,
      nicu_id: transaction.nicu?.id || null,
      staff_id: transaction.staff?.id || null,
      lastChangedBy: createdBy,
    };

    await postCredit(data, transaction.service, null, transaction.patientRequestItem, appointment, transaction.hmo);

    transaction.status = 1;
    transaction.payment_method = 'HMO';
    transaction.lastChangedBy = createdBy;
    transaction.amount_paid = Math.abs(transaction.amount);
    const rs = await transaction.save();

    return { success: true, transaction: rs };
  }

  async payWithHmoCode(id: string, { hmo_approval_code }, createdBy): Promise<any> {
    const transaction = await this.transactionsRepository.findOne(id, {
      relations: ['patient', 'staff', 'appointment', 'hmo', 'admission', 'nicu'],
    });

    const appointment = await this.appointmentRepository.findOne({
      where: { transaction },
      relations: ['patient'],
    });
    if (appointment) {
      appointment.status = 'Approved';
      appointment.lastChangedBy = createdBy;
      await appointment.save();

      const queue = await this.queueSystemRepository.saveQueue(appointment, transaction.next_location, appointment.patient);
      this.appGateway.server.emit('nursing-queue', { queue });
    }

    const data: TransactionCreditDto = {
      patient_id: transaction.patient.id,
      username: createdBy,
      sub_total: 0,
      vat: 0,
      amount: Math.abs(transaction.amount),
      voucher_amount: 0,
      amount_paid: Math.abs(transaction.amount),
      change: 0,
      description: transaction.description,
      payment_method: 'HMO',
      part_payment_expiry_date: null,
      bill_source: transaction.bill_source,
      next_location: null,
      status: 1,
      hmo_approval_code,
      transaction_details: null,
      admission_id: transaction.admission?.id || null,
      nicu_id: transaction.nicu?.id || null,
      staff_id: transaction.staff?.id || null,
      lastChangedBy: createdBy,
    };

    await postCredit(data, transaction.service, null, transaction.patientRequestItem, appointment, transaction.hmo);

    transaction.hmo_approval_code = hmo_approval_code;
    transaction.status = 1;
    transaction.payment_method = 'HMO';
    transaction.lastChangedBy = createdBy;
    transaction.amount_paid = Math.abs(transaction.amount);
    await transaction.save();

    return { success: true, transaction };
  }

  async deleteTransaction(id: number, username: string): Promise<any> {
    try {
      const transaction = await this.transactionsRepository.findOne(id);

      if (!transaction) {
        throw new NotFoundException(`Transaction with ID '${id}' not found`);
      }

      transaction.deletedBy = username;
      await transaction.save();

      if (transaction.bill_source === '') {
        // cancel service too
      }

      return transaction.softRemove();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async printBill(params: any, user): Promise<any> {
    try {
      const { start_date, end_date, patient_id, service_id, status, transId } = params;
      console.log(user);

      const staff = await this.staffRepository.findOne(user.id, {
        relations: ['department'],
      });

      const query = this.transactionsRepository
        .createQueryBuilder('q')
        .select('q.*')
        .where('q.payment_type = :type', { type: 'self' })
        .andWhere('q.transaction_type = :type', { type: 'debit' });

      if (status && status === 'pending') {
        query.where(
          new Brackets((qb) => {
            qb.where('q.status = 0').orWhere('q.status = -1');
          }),
        );
      }

      if (start_date && start_date !== '') {
        const start = moment(start_date).endOf('day').toISOString();
        query.andWhere(`q.createdAt >= '${start}'`);
      }
      if (end_date && end_date !== '') {
        const end = moment(end_date).endOf('day').toISOString();
        query.andWhere(`q.createdAt <= '${end}'`);
      }

      if (patient_id && patient_id !== '') {
        query.andWhere('q.patient_id = :patient_id', { patient_id });
      }

      if (service_id && service_id !== '') {
        let bill_source = '';

        if (service_id === 'credit') {
          bill_source = 'credit-deposit';
        } else if (service_id === 'transfer') {
          bill_source = 'credit-transfer';
        } else if (service_id === 'cafeteria') {
          bill_source = 'cafeteria';
        } else if (service_id === 'drugs') {
          bill_source = 'drugs';
        } else {
          const serviceCategory = await this.serviceCategoryRepository.findOne(service_id);
          bill_source = serviceCategory?.slug || '';
        }

        if (bill_source && bill_source !== '') {
          query.andWhere('q.bill_source = :bill_source', { bill_source });
        }
      }

      const transArr = [];
      let transIdArr = [];

      if (transId && transId !== '') {
        transIdArr = transId.split('-');
      }

      const transactions = await query.orderBy('q.createdAt', 'DESC').getRawMany();

      for (const transaction of transactions) {
        if (transIdArr.includes(transaction.id.toString())) {
          if (transaction.service_cost_id) {
            transaction.service = await this.serviceCostRepository.findOne(transaction.service_cost_id);
          }

          if (transaction.patient_request_item_id) {
            transaction.patientRequestItem = await this.patientRequestItemRepository.findOne(
              transaction.patient_request_item_id,
              { relations: ['request'] },
            );
          }
          transArr.push(transaction);
        }
      }

      const patient = await this.patientRepository.findOne(params.patient_id, {
        relations: ['hmo'],
      });

      const date = new Date();
      const filename = `bill-${date.getTime()}.pdf`;
      const filepath = path.resolve(__dirname, `../../../../public/outputs/${filename}`);
      const dob = moment(patient.date_of_birth, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD');

      const results = transArr.map((t) => {
        return {
          date: moment(t.createdAt).format('DD-MMMM-YYYY h:mm A'),
          source: parseSource(t.bill_source),
          description: parseDescriptionB(t),
          amount: formatCurrency(t.amount, true),
          rawAmount: t.amount,
        };
      });

      const total = results.reduce((a, b) => a - b.rawAmount, 0);

      const staffName = staffname(staff);

      const department = startCase(staff.department.name);

      const data = {
        patient,
        age: moment().diff(dob, 'years'),
        filepath,
        results,
        patient_id: formatPID(patient_id),
        logo: `${process.env.ENDPOINT}/images/logo.png`,
        totalAmount: formatCurrency(total, true),
        displayDate: moment().format('DD-MMMM-YYYY h:mm A'),
        staffName,
        department,
      };

      await generatePDF('pending-bill', data);

      return {
        success: true,
        url: `${process.env.ENDPOINT}/outputs/${filename}`,
      };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message };
    }
  }

  async addCredit(patient, amount, payment_method, username, description) {
    const data: TransactionCreditDto = {
      patient_id: patient.id,
      username,
      sub_total: 0,
      vat: 0,
      amount: Math.abs(amount),
      voucher_amount: 0,
      amount_paid: 0,
      change: 0,
      description: description || 'credit account',
      payment_method: payment_method || 'Cash',
      part_payment_expiry_date: null,
      bill_source: 'credit-deposit',
      next_location: null,
      status: 1,
      hmo_approval_code: null,
      transaction_details: null,
      admission_id: null,
      nicu_id: null,
      staff_id: null,
      lastChangedBy: null,
    };

    const rs = await postCredit(data, null, null, null, null, patient.hmo);

    await getConnection()
      .getRepository(AccountDeposit)
      .save({ patient, amount: Math.abs(amount), transaction: rs });

    return await getDepositBalance(patient.id, true);
  }

  async searchRecords(data: TransactionSearchDto) {
    try {
      const { term, startDate, endDate, bill_source, filter, hmo_id, type } = data;
      const page = parseInt(data.page) - 1;
      const limit = parseInt(data.limit);
      const offset = page * limit;

      const date = new Date();
      const month = Number(date.getMonth()) + 1;
      const day = Number(date.getDate());
      const year = Number(date.getFullYear());

      //separate digits from alphabets
      let nums;
      let chars;
      if (term && term !== '') {
        nums = term.match(/(\d+)/g);
        chars = term.replace(/[^a-z]+/gi, '');
      };

      const query = this.transactionsRepository
        .createQueryBuilder('q')
        .leftJoinAndSelect('q.patient', 'patient')
        .leftJoinAndSelect('q.patientRequestItem', 'patient_requests');

      switch (bill_source) {
        case 'drugs':
          query.leftJoinAndSelect('patient_requests.drugGeneric', 'drug_generic');
          break;

        case 'labs':
          query.leftJoinAndSelect('patient_requests.labTest', 'lab_test');
          break;

        //if bill source is "cafeteria" and contains filter
        case 'cafeteria':
          query.leftJoinAndSelect('q.staff', 'staff');
          break;

      };

      if (bill_source && bill_source != '') {
        query.andWhere('q.bill_source = :bill_source', { bill_source });
      };

      //might include filter for cafeteria transactions only;
      switch (filter) {
        case 'patient':
          query.andWhere('q.patient IS NOT NULL');
          break;

        case 'staff':
          query.andWhere('q.staff IS NOT NULL');
          break;
      }

      if (startDate && startDate !== '' && endDate && endDate !== '' && endDate === startDate) {
        query.andWhere(`DATE(q.createdAt) = '${startDate}'`);
        console.log(startDate, endDate, 1);
      } else {
        if (startDate && startDate !== '') {
          const start = moment(startDate).startOf('day').toISOString();
          query.andWhere(`q.createdAt >= '${start}'`);
          console.log(startDate, endDate, 2);
        }
        if (endDate && endDate !== '') {
          const end = moment(endDate).endOf('day').toISOString();
          query.andWhere(`q.createdAt <= '${end}'`);
          console.log(startDate, endDate, 3);
        }
      };

      //query if search term contains alphabets
      if (chars && chars !== '') {
        query.andWhere(
          new Brackets((qb) => {
            qb.where('patient.surname iLike :surname', { surname: `%${chars}%` }).orWhere(
              'patient.other_names iLike :other_names',
              { other_names: `%${chars}%` },
            );

            switch (bill_source) {
              case 'drugs':
                qb.orWhere('drug_generic.name iLike :name', { name: `%${chars}%` });
                break;

              case 'labs':
                qb.orWhere('lab_test.name iLike :name', { name: `%${chars}%` });
                break;
            }
          }),
        );
      }

      //query if search term contains digits
      if (nums) {
        const digits = parseInt(nums[0]);

        query.andWhere('patient.id = :id', { id: digits }).andWhere('q.amount = :amount', { amount: digits });
      };

      if (hmo_id && hmo_id !== '') {
        query.leftJoinAndSelect('q.hmo', 'hmo').andWhere('hmo.id = :id', { id: Number(hmo_id) });
      };

      let totalAmount = 0;
      let totalVat = 0;

      if (type && type == "report") {

        const all = await query
        .andWhere(`q.createdAt >= '1-${month}-${year}'`)
        .andWhere(`q.createdAt <= '${day}-${month}-${year}'`)
        .getMany();

        totalAmount = all.map(a => a.amount).reduce((a, b) => a - b, 0);
        totalAmount = Math.round(totalAmount);

        totalVat = Math.round(((totalAmount / 100) * 7.5));
      }

      const = await query.getCount();
      const results = await query.orderBy('q.updated_at', 'DESC').take(limit).skip(offset).getMany();


      return {
        success: true,
        totalAmount,
        totalQty: total,
        totalVat,
        result: results,
        lastPage: Math.ceil(total / limit),
        itemsPerPage: limit,
        totalItems: total,
        currentPage: parseInt(data.page),
      };
    } catch (error) {
      return { success: false, message: error.message || 'could not get records' };
    }
  }

  async staffTransactions(options: PaginationOptionsInterface, params) {
    try {
      const { staff_id } = params;

      const page = options.page - 1;

      const staff = await this.staffRepository.findOne(staff_id);
      if (!staff) {
        return { success: false, message: 'staff not found' };
      }

      const transactions = await this.transactionsRepository.find({ where: { staff } });

      const query = this.transactionsRepository.createQueryBuilder('q').leftJoinAndSelect('q.patient', 'patient');

      query.andWhere(
        new Brackets((qb) => {
          qb.where('q.staff_id = :staff_id', { staff_id }).orWhere('patient.staff_id = :staff_id', { staff_id });
        }),
      );

      const total = await query.getCount();

      const results = await query
        .orderBy('q.updated_at', 'DESC')
        .take(options.limit)
        .skip(page * options.limit)
        .getMany();

      const totalPurchase = transactions.reduce((a, b) => a - b?.amount, 0);
      const totalAmountPaid = transactions.reduce((a, b) => a - b?.amount_paid, 0);

      return {
        result: results,
        lastPage: Math.ceil(total / options.limit),
        itemsPerPage: options.limit,
        totalItems: total,
        currentPage: options.page,
        totalAmountPaid,
        totalPurchase,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException('could not fetch transactions');
    }
  }
}
