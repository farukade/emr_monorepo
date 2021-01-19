import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionsRepository } from './transactions.repository';
import * as moment from 'moment';
import { PatientRepository } from '../../patient/repositories/patient.repository';
import { Transactions } from './transaction.entity';
import { TransactionDto } from './dto/transaction.dto';
import { ServiceRepository } from '../../settings/services/service.repository';
import { Patient } from '../../patient/entities/patient.entity';
import { ProcessTransactionDto } from './dto/process-transaction.dto';
import { VoucherRepository } from '../vouchers/voucher.repository';
import { StaffRepository } from '../../hr/staff/staff.repository';
import { Pagination, PaginationOptionsInterface } from '../../../common/paginate';
import { QueueSystemRepository } from '../../frontdesk/queue-system/queue-system.repository';
import { AppointmentRepository } from '../../frontdesk/appointment/appointment.repository';
import { AppGateway } from '../../../app.gateway';

@Injectable()
export class TransactionsService {

    constructor(
        @InjectRepository(AppointmentRepository)
        private appointmentRepository: AppointmentRepository,
        @InjectRepository(TransactionsRepository)
        private transactionsRepository: TransactionsRepository,
        @InjectRepository(PatientRepository)
        private patientRepository: PatientRepository,
        @InjectRepository(ServiceRepository)
        private serviceRepository: ServiceRepository,
        @InjectRepository(VoucherRepository)
        private voucherRepository: VoucherRepository,
        @InjectRepository(StaffRepository)
        private staffRepository: StaffRepository,
        @InjectRepository(QueueSystemRepository)
        private queueSystemRepository: QueueSystemRepository,
        private readonly appGateway: AppGateway,
    ) {
    }

    async fetchList(options: PaginationOptionsInterface, params): Promise<Transactions[]> {
        const { startDate, endDate, patient_id, staff_id, status, payment_type, transaction_type } = params;

        const query = this.transactionsRepository.createQueryBuilder('q').select('q.*');

        if (transaction_type && transaction_type !== '') {
            query.where('q.transaction_type = :type', { type: transaction_type });
        }

        if (startDate && startDate !== '') {
            const start = moment(startDate).startOf('day').toISOString();
            query.andWhere(`q.createdAt >= '${start}'`);
        }
        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt <= '${end}'`);
        }
        if (payment_type && payment_type !== '') {
            query.andWhere(`q.payment_type = '${payment_type}'`);
        }
        if (patient_id && patient_id !== '') {
            query.andWhere('q.patient_id = :patient_id', { patient_id });
        }

        if (staff_id && staff_id !== '') {
            query.andWhere('q.staff_id = :staff_id', { staff_id });
        }

        // if (status) {
        //     query.andWhere('q.status = :status', {status});
        // }

        const transactions = await query.skip((options.page * options.limit) - options.page)
            .limit(options.limit)
            .orderBy('q.createdAt', 'DESC')
            .getRawMany();

        for (const transaction of transactions) {

            if (transaction.staff_id) {
                transaction.staff = await this.staffRepository.findOne(transaction.staff_id);
            }

            if (transaction.patient_id) {
                transaction.patient = await this.patientRepository.findOne(transaction.patient_id);
            }

            if (transaction.service_id) {
                transaction.service = await this.serviceRepository.findOne(transaction.service_id);
            }
        }

        return transactions;
    }

    async fetchPending(options: PaginationOptionsInterface, params) {
        return await this.transactionsRepository.find({ where: { status: 0 }, relations: ['patient', 'serviceType'] });
    }

    async fetchDashboardTransactions() {
        const startOfDay = moment().startOf('day').toISOString();
        const endOfDay = moment().endOf('day').toISOString();
        const dailyTotal = await this.transactionsRepository.createQueryBuilder('transaction')
            .where('transaction.transaction_type = :type', { type: 'billing' })
            .andWhere(`transaction.createdAt >= '${startOfDay}'`)
            .andWhere(`transaction.createdAt <= '${endOfDay}'`)
            .select('SUM(amount) as amount')
            .getRawOne();
        const unpaidTotal = await this.transactionsRepository.createQueryBuilder('transaction')
            .where('transaction.transaction_type = :type', { type: 'billing' })
            // .andWhere(`transaction.createdAt >= '${startOfDay}'`)
            // .andWhere(`transaction.createdAt <= '${endOfDay}'`)
            .andWhere('transaction.status = :status', { status: 0 })
            .select('SUM(amount) as amount')
            .getRawOne();
        const totalCash = await this.transactionsRepository.createQueryBuilder('transaction')
            .where('transaction.transaction_type = :type', { type: 'billing' })
            // .andWhere(`transaction.createdAt >= '${startOfDay}'`)
            // .andWhere(`transaction.createdAt <= '${endOfDay}'`)
            .andWhere('transaction.status = :status', { status: 1 })
            .andWhere('transaction.payment_type = :tran_type', { tran_type: 'Cash' })
            .select('SUM(amount) as amount')
            .getRawOne();
        const totalPOS = await this.transactionsRepository.createQueryBuilder('transaction')
            .where('transaction.transaction_type = :type', { type: 'billing' })
            // .andWhere(`transaction.createdAt >= '${startOfDay}'`)
            // .andWhere(`transaction.createdAt <= '${endOfDay}'`)
            .andWhere('transaction.status = :status', { status: 1 })
            .andWhere('transaction.payment_type = :tran_type', { tran_type: 'POS' })
            .select('SUM(amount) as amount')
            .getRawOne();
        const totalCheque = await this.transactionsRepository.createQueryBuilder('transaction')
            .where('transaction.transaction_type = :type', { type: 'billing' })
            // .andWhere(`transaction.createdAt >= '${startOfDay}'`)
            // .andWhere(`transaction.createdAt <= '${endOfDay}'`)
            .andWhere('transaction.status = :status', { status: 1 })
            .andWhere('transaction.payment_type = :tran_type', { tran_type: 'Cheque' })
            .select('SUM(amount) as amount')
            .getRawOne();
        const totalOutstanding = await this.transactionsRepository.createQueryBuilder('transaction')
            .where('transaction.transaction_type = :type', { type: 'billing' })
            // .andWhere(`transaction.createdAt >= '${startOfDay}'`)
            // .andWhere(`transaction.createdAt <= '${endOfDay}'`)
            .andWhere('transaction.status = :status', { status: 1 })
            .select('SUM(balance) as amount')
            .getRawOne();
        return { dailyTotal, unpaidTotal, totalCash, totalPOS, totalCheque, totalOutstanding };
    }

    async listDashboardTransactions(params) {
        const { transactionType, startDate, endDate } = params;

        const query = this.transactionsRepository.createQueryBuilder('transaction')
            .innerJoin(Patient, 'patient', 'transaction.patient_id = patient.id')
            .addSelect('patient.surname, patient.other_names')
            .where('transaction.transaction_type = :type', { type: 'billing' });
        if (startDate && startDate !== '') {
            const start = moment(startDate).startOf('day').toISOString();
            query.andWhere(`transaction.createdAt >= '${start}'`);
        } else {
            const start = moment().startOf('day').toISOString();
            query.andWhere(`transaction.createdAt >= '${start}'`);
        }
        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.andWhere(`transaction.createdAt <= '${end}'`);
        } else {
            const end = moment().endOf('day').toISOString();
            query.andWhere(`transaction.createdAt <= '${end}'`);

        }
        let result;
        switch (transactionType) {
            case 'daily-total':
                result = await query.getRawMany();
                break;
            case 'total-unpaid':
                result = await query.andWhere('transaction.status = :status', { status: 0 }).orderBy('transaction.createdAt', 'DESC').getRawMany();
                break;
            case 'total-cash':
                result = await query.andWhere('transaction.status = :status', { status: 1 })
                    .andWhere('transaction.payment_type = :tran_type', { tran_type: 'Cash' })
                    .orderBy('transaction.createdAt', 'DESC')
                    .getRawMany();
                break;
            case 'total-pos':
                result = await query.andWhere('transaction.status = :status', { status: 1 })
                    .andWhere('transaction.payment_type = :tran_type', { tran_type: 'POS' })
                    .orderBy('transaction.createdAt', 'DESC')
                    .getRawMany();
                break;
            case 'total-cheque':
                result = await query.andWhere('transaction.status = :status', { status: 1 })
                    .andWhere('transaction.payment_type = :tran_type', { tran_type: 'Cheque' })
                    .orderBy('transaction.createdAt', 'DESC')
                    .getRawMany();
                break;
            case 'total-outstanding':
                result = await query.andWhere('transaction.status = :status', { status: 1 })
                    .andWhere('transaction.balance > :balance', { balance: 0 })
                    .orderBy('transaction.createdAt', 'DESC')
                    .getRawMany();
                break;
            default:
                break;
        }
        return result;
    }

    async save(transactionDto: TransactionDto, createdBy): Promise<any> {
        const { patient_id, serviceType, amount, description, payment_type } = transactionDto;
        // find patient record
        const patient = await this.patientRepository.findOne(patient_id);
        const items = [];
        for (const serviceId of serviceType) {
            // find service record
            const service = await this.serviceRepository.findOne(serviceId);
            items.push({ name: service.name, amount: service.tariff });
        }

        try {
            const transaction = await this.transactionsRepository.save({
                patient,
                amount,
                description,
                payment_type,
                transaction_type: 'billing',
                transaction_details: items,
                amount_paid: amount,
                createdBy,
                lastChangedBy: createdBy,
                status: 1,
            });
            return { success: true, transaction };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async update(id: string, transactionDto: TransactionDto, createdBy): Promise<any> {
        const { patient_id, serviceType, amount, description, payment_type } = transactionDto;
        // find patient record
        const patient = await this.patientRepository.findOne(patient_id);
        const items = [];
        for (const serviceId of serviceType) {
            // find service record
            const service = await this.serviceRepository.findOne(serviceId);
            items.push({ name: service.name, amount: service.tariff });

        }
        try {
            const transaction = await this.transactionsRepository.findOne(id);
            transaction.patient = patient;
            transaction.amount = amount;
            transaction.description = description;
            transaction.payment_type = payment_type;
            transaction.transaction_details = items;
            transaction.lastChangedBy = createdBy;
            await transaction.save();

            return { success: true, transaction };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async processTransaction(id: string, transactionDto: ProcessTransactionDto, updatedBy): Promise<any> {
        const { voucher_id, amount_paid, voucher_amount, payment_type } = transactionDto;
        try {
            const transaction = await this.transactionsRepository.findOne(id, { relations: ['patient'] });
            transaction.amount_paid = amount_paid;
            transaction.payment_type = payment_type;
            if (payment_type === 'Voucher') {
                const voucher = await this.voucherRepository.findOne(voucher_id);
                transaction.voucher = voucher;
                transaction.voucher_amount = voucher_amount;
                voucher.amount_used = voucher.amount_used + voucher_amount;
                await voucher.save();
                if (voucher.amount_used === voucher.amount) {
                    voucher.isActive = false;
                    await voucher.save();
                }
            }
            if (amount_paid < transaction.amount) {
                transaction.balance = transaction.amount - amount_paid;
            }

            let queue;
            if (transaction.next_location && transaction.next_location === 'vitals') {
                // find appointment
                const appointment = await this.appointmentRepository.findOne({
                    where: { transaction_id: transaction.id },
                    relations: ['patient', 'whomToSee', 'consultingRoom', 'serviceCategory', 'serviceType'],
                });
                // console.log(appointment);
                // create new queue
                if (!appointment) {
                    return { success: false, message: 'Cannot find appointment' };
                }
                queue = await this.queueSystemRepository.saveQueue(appointment, transaction.next_location);
                this.appGateway.server.emit('nursing-queue', { queue });
            }
            transaction.next_location = null;
            transaction.status = 1;
            transaction.lastChangedBy = updatedBy;
            await transaction.save();

            return { success: true, transaction, queue };
        } catch (error) {
            console.log(error);
            return { success: false, message: error.message };
        }
    }

    async delete(id: string): Promise<void> {
        const result = await this.transactionsRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Transaction with ID '${id}' not found`);
        }
    }

    async getTransaction(id: string): Promise<Transactions> {
        const result = await this.transactionsRepository.findOne({ where: { id } });

        if (!result) {
            throw new NotFoundException(`Transaction with ID '${id}' not found`);
        }

        return result;
    }

    async cafeteriaDailyTotal() {
        const startOfDay = moment().startOf('day').toISOString();
        const endOfDay = moment().endOf('day').toISOString();
        const query = await this.transactionsRepository.createQueryBuilder('transaction')
            .where('transaction.transaction_type = :type', { type: 'cafeteria' })
            .andWhere(`transaction.createdAt >= '${startOfDay}'`)
            .andWhere(`transaction.createdAt <= '${endOfDay}'`)
            .select('SUM(amount) as amount')
            .getRawOne();
        return query;
    }

    async personalCafeterialBill(userId) {
        const query = await this.transactionsRepository.createQueryBuilder('transaction')
            .where('transaction.transaction_type = :type', { type: 'cafeteria' })
            .andWhere('transaction.staff_id = :user', { user: `${userId}` })
            .andWhere('transaction.status = :status', { status: 0 })
            .getRawOne();

        return query;
    }
}
