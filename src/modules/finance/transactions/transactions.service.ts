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
import { PaginationOptionsInterface } from '../../../common/paginate';
import { QueueSystemRepository } from '../../frontdesk/queue-system/queue-system.repository';
import { AppointmentRepository } from '../../frontdesk/appointment/appointment.repository';
import { AppGateway } from '../../../app.gateway';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { Brackets } from 'typeorm';
import { getStaff } from '../../../common/utils/utils';

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

    async fetchList(options: PaginationOptionsInterface, params): Promise<Pagination> {
        const { startDate, endDate, patient_id, staff_id, payment_type, transaction_type } = params;

        const page = options.page - 1;

        const query = this.transactionsRepository.createQueryBuilder('q').select('q.*');

        if (transaction_type && transaction_type !== '') {
            query.where('q.transaction_type = :type', { type: transaction_type });
        }

        if (startDate && startDate !== '') {
            const start = moment(startDate).endOf('day').toISOString();
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

        const transactions = await query.offset(page * options.limit)
            .limit(options.limit)
            .orderBy('q.createdAt', 'DESC')
            .getRawMany();

        const total = await query.getCount();

        for (const transaction of transactions) {
            if (transaction.staff_id) {
                transaction.staff = await this.staffRepository.findOne(transaction.staff_id);
            }

            if (transaction.patient_id) {
                transaction.patient = await this.patientRepository.findOne(transaction.patient_id, {
                    relations: ['nextOfKin', 'immunization', 'hmo'],
                });
            }

            if (transaction.service_id) {
                transaction.service = await this.serviceRepository.findOne(transaction.service_id);
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

    async fetchPending(options: PaginationOptionsInterface, params): Promise<Pagination> {
        const { startDate, endDate, patient_id } = params;

        const query = this.transactionsRepository.createQueryBuilder('q').select('q.*');

        query.where(new Brackets(qb => {
            qb.where('q.status = 0').orWhere('q.status = -1');
        }));

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

        const page = options.page - 1;

        const transactions = await query.offset(page * options.limit)
            .limit(options.limit)
            .orderBy('q.createdAt', 'DESC')
            .getRawMany();

        const total = await query.getCount();

        for (const transaction of transactions) {

            if (transaction.patient_id) {
                transaction.patient = await this.patientRepository.findOne(transaction.patient_id);
            }

            if (transaction.service_id) {
                transaction.service = await this.serviceRepository.findOne(transaction.service_id);
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
        const patient = await this.patientRepository.findOne(patient_id, { relations: ['hmo'] });
        const items = [];
        for (const serviceId of serviceType) {
            // find service record
            const service = await this.serviceRepository.findOne(serviceId);
            items.push({ name: service.name, amount: service.tariff });
        }

        const date = new Date();
        date.setDate(date.getDate() - 1);

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
                staff: await getStaff(createdBy),
                status: 1,
                hmo: patient.hmo,
            });
            return { success: true, transaction };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async update(id: string, transactionDto: TransactionDto, createdBy, code: string): Promise<any> {

        if (code) {
            const transaction = await this.transactionsRepository.findOne(id);
            transaction.hmo_approval_code = code;
            transaction.staff = await getStaff(createdBy);
            transaction.status = 1;
            transaction.save();

            return { success: true, transaction };
        }

        const { patient_id, serviceType, amount, description, payment_type } = transactionDto;

        // find patient record
        const patient = await this.patientRepository.findOne(patient_id, { relations: ['hmo'] });
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
            transaction.hmo_approval_code = code;
            transaction.staff = await getStaff(createdBy);
            transaction.hmo = patient.hmo;
            const data = await transaction.save();

            return { success: true, transaction: data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async decline(id: number, createdBy): Promise<any> {
        const transaction = await this.transactionsRepository.findOne(id);

        let amount = 0;
        if (transaction.transaction_type === 'registration') {
            amount = parseFloat(transaction.transaction_details.tariff);
        } else {
            amount = parseFloat(transaction.transaction_details.price);
        }

        transaction.payment_type = '';
        transaction.status = 0;
        transaction.amount = amount;
        const rs = await transaction.save();

        return { success: true, transaction };
    }

    async processTransaction(id: number, transactionDto: ProcessTransactionDto, updatedBy): Promise<any> {
        const { voucher_id, amount_paid, voucher_amount, payment_type, patient_id, is_part_payment } = transactionDto;
        try {
            const transaction = await this.transactionsRepository.findOne(id, { relations: ['patient', 'staff', 'serviceType', 'patientRequestItem', 'request', 'appointment', 'hmo'] });

            if (is_part_payment && amount_paid < transaction.amount) {
                const balance = new Transactions();
                balance.createdBy = updatedBy;
                balance.amount = transaction.amount - amount_paid;
                balance.description = transaction.description;
                balance.transaction_type = transaction.transaction_type;
                balance.next_location = transaction.next_location;
                balance.hmo_approval_code = transaction.hmo_approval_code;
                balance.transaction_details = transaction.transaction_details;
                balance.patient = transaction.patient;
                balance.staff = transaction.staff;
                balance.serviceType = transaction.serviceType;
                balance.patientRequestItem = transaction.patientRequestItem;
                balance.request = transaction.request;
                balance.appointment = transaction.appointment;
                balance.status = -1;
                balance.hmo = transaction.hmo;
                await balance.save();
            }

            transaction.amount_paid = amount_paid;
            transaction.payment_type = payment_type;
            if (payment_type === 'Voucher') {
                const voucher = await this.voucherRepository.findOne(voucher_id, { relations: ['patient'] });

                if (voucher.patient.id !== patient_id) {
                    return { success: false, message: 'invalid voucher code' };
                } else if (!voucher.isActive) {
                    return { success: false, message: 'voucher code has been used' };
                }

                transaction.voucher = voucher;
                transaction.voucher_amount = voucher_amount;

                voucher.amount_used = voucher_amount;
                voucher.isActive = false;
                await voucher.save();
            }

            if (is_part_payment && amount_paid < transaction.amount) {
                transaction.balance = transaction.amount - amount_paid;
            }

            let queue;
            if (transaction.next_location && transaction.next_location === 'vitals') {
                // find appointment
                console.log(transaction.id);
                const appointment = await this.appointmentRepository.findOne({
                    where: { transaction: transaction.id },
                    relations: ['patient', 'whomToSee', 'consultingRoom', 'serviceCategory', 'serviceType'],
                });
                appointment.status = 'Approved';
                appointment.save();
                console.log(appointment);
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
            transaction.staff = await getStaff(updatedBy);
            await transaction.save();

            return { success: true, transaction, queue };
        } catch (error) {
            console.log(error);
            return { success: false, message: error.message };
        }
    }

    async deleteTransaction(id: number, username: string): Promise<any> {
        const transaction = await this.transactionsRepository.findOne(id);

        if (!transaction) {
            throw new NotFoundException(`Transaction with ID '${id}' not found`);
        }
        transaction.deletedBy = username;
        await transaction.save();

        return transaction.softRemove();
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
