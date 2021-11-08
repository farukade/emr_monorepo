import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionsRepository } from './transactions.repository';
import * as moment from 'moment';
import { PatientRepository } from '../../patient/repositories/patient.repository';
import { Transactions } from './transaction.entity';
import { TransactionDto } from './dto/transaction.dto';
import { ServiceRepository } from '../../settings/services/repositories/service.repository';
import { ProcessTransactionDto } from './dto/process-transaction.dto';
import { VoucherRepository } from '../vouchers/voucher.repository';
import { StaffRepository } from '../../hr/staff/staff.repository';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { QueueSystemRepository } from '../../frontdesk/queue-system/queue-system.repository';
import { AppointmentRepository } from '../../frontdesk/appointment/appointment.repository';
import { AppGateway } from '../../../app.gateway';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { Brackets, getConnection } from 'typeorm';
import { getStaff } from '../../../common/utils/utils';
import { Settings } from '../../settings/entities/settings.entity';
import { ServiceCostRepository } from '../../settings/services/repositories/service_cost.repository';
import { HmoSchemeRepository } from '../../hmo/repositories/hmo_scheme.repository';
import { PatientRequestItemRepository } from '../../patient/repositories/patient_request_items.repository';

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
        @InjectRepository(ServiceCostRepository)
        private serviceCostRepository: ServiceCostRepository,
        @InjectRepository(VoucherRepository)
        private voucherRepository: VoucherRepository,
        @InjectRepository(StaffRepository)
        private staffRepository: StaffRepository,
        @InjectRepository(HmoSchemeRepository)
        private hmoSchemeRepository: HmoSchemeRepository,
        @InjectRepository(QueueSystemRepository)
        private queueSystemRepository: QueueSystemRepository,
        @InjectRepository(PatientRequestItemRepository)
        private patientRequestItemRepository: PatientRequestItemRepository,
        private readonly appGateway: AppGateway,
    ) {
    }

    async fetchList(options: PaginationOptionsInterface, params): Promise<Pagination> {
        const { startDate, endDate, patient_id, staff_id, bill_source, status } = params;

        const page = options.page - 1;

        const query = this.transactionsRepository.createQueryBuilder('q').select('q.*')
            .where('q.payment_type = :type', { type: 'self' });

        if (bill_source && bill_source !== '') {
            query.where('q.bill_source = :type', { type: bill_source });
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
            query.andWhere('q.status = :status', { status });
        }

        const transactions = await query.offset(page * options.limit)
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
                transaction.patientRequestItem = await this.patientRequestItemRepository.findOne(transaction.patient_request_item_id, { relations: ['request'] });
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
        const { startDate, endDate, patient_id, bill_source } = params;

        const query = this.transactionsRepository.createQueryBuilder('q').select('q.*')
            .where('q.payment_type = :type', { type: 'self' });

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

        if (bill_source && bill_source !== '') {
            query.where('q.bill_source = :type', { type: bill_source });
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

            if (transaction.service_cost_id) {
                transaction.service = await this.serviceCostRepository.findOne(transaction.service_cost_id);
            }

            if (transaction.patient_request_item_id) {
                transaction.patientRequestItem = await this.patientRequestItemRepository.findOne(transaction.patient_request_item_id, { relations: ['request'] });
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

    async save(transactionDto: TransactionDto, createdBy): Promise<any> {
        const { patient_id, hmo_id, service_id, amount, description } = transactionDto;

        // find patient record
        const patient = await this.patientRepository.findOne(patient_id);

        let hmo = await this.hmoSchemeRepository.findOne(hmo_id);

        const service = await this.serviceRepository.findOne(service_id);

        let serviceCost = await this.serviceCostRepository.findOne({ where: { item: service, hmo } });
        if (!serviceCost || (serviceCost && serviceCost.tariff === 0)) {
            hmo = await this.hmoSchemeRepository.findOne({ where: { name: 'Private' } });
            serviceCost = await this.serviceCostRepository.findOne({ where: { item: service, hmo } });
        }

        const item = { name: service.name, amount: serviceCost.tariff };

        try {
            const transaction = await this.transactionsRepository.save({
                patient,
                amount: amount * -1,
                description,
                payment_type: hmo.name === 'Private' ? 'self' : 'HMO',
                bill_source: service.category.name,
                transaction_details: [item],
                amount_paid: amount,
                createdBy,
                lastChangedBy: createdBy,
                status: 1,
                hmo,
                service: serviceCost,
                transaction_type: 'debit',
                balance: 0,
            });
            return { success: true, transaction };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async pay(id: string, { hmo_approval_code }, createdBy): Promise<any> {
        const transaction = await this.transactionsRepository.findOne(id);

        const appointment = await this.appointmentRepository.findOne({
            where: { transaction },
            relations: ['patient'],
        });
        if(appointment){
            appointment.status = 'Approved';
            appointment.lastChangedBy = createdBy;
            await appointment.save();

            const queue = await this.queueSystemRepository.saveQueue(appointment, transaction.next_location, appointment.patient);
            this.appGateway.server.emit('nursing-queue', { queue });
        }
        
        transaction.hmo_approval_code = hmo_approval_code;
        transaction.status = 1;
        transaction.balance = 0;
        transaction.payment_method = 'HMO';
        transaction.lastChangedBy = createdBy;
        await transaction.save();

        return { success: true, transaction };
    }

    async approve(id: number, createdBy): Promise<any> {
        const transaction = await this.transactionsRepository.findOne(id);

        const appointment = await this.appointmentRepository.findOne({
            where: { transaction },
            relations: ['patient'],
        });
        if(appointment){
            appointment.status = 'Approved';
            appointment.lastChangedBy = createdBy;
            await appointment.save();

            const queue = await this.queueSystemRepository.saveQueue(appointment, transaction.next_location, appointment.patient);
            this.appGateway.server.emit('nursing-queue', { queue });
        }

        transaction.status = 1;
        transaction.balance = 0;
        transaction.payment_method = 'HMO';
        transaction.lastChangedBy = createdBy;
        const rs = await transaction.save();

        return { success: true, transaction: rs };
    }

    async transfer(id: number, createdBy): Promise<any> {
        const transaction = await this.transactionsRepository.findOne(id);

        const hmo = await this.hmoSchemeRepository.findOne({ where: { name: 'Private' } });

        const serviceCost = await this.serviceCostRepository.findOne({ where: { code: transaction.service.code, hmo } });

        transaction.payment_type = 'self';
        transaction.amount = serviceCost.tariff * -1;
        transaction.balance = serviceCost.tariff * -1;
        transaction.transaction_details = { ...transaction.transaction_details, amount: serviceCost.tariff };
        transaction.hmo = hmo;
        transaction.lastChangedBy = createdBy;
        const rs = await transaction.save();

        return { success: true, transaction: rs };
    }

    async processTransaction(id: number, transactionDto: ProcessTransactionDto, updatedBy): Promise<any> {
        const { voucher_id, amount_paid, voucher_amount, payment_method, patient_id, is_part_payment } = transactionDto;
        try {
            const transaction = await this.transactionsRepository.findOne(id, { relations: ['patient', 'staff', 'appointment', 'hmo'] });

            if (is_part_payment && amount_paid < transaction.amount) {
                const duration = await getConnection().getRepository(Settings).findOne({ where: { slug: 'part-payment-duration' } });
                const date = moment().add(duration.value, 'd').format('YYYY-MM-DD');

                const balance = new Transactions();
                balance.createdBy = transaction.createdBy;
                balance.amount = ((transaction.amount * -1) - amount_paid) * -1;
                balance.description = transaction.description;
                balance.bill_source = transaction.bill_source;
                balance.next_location = transaction.next_location;
                balance.hmo_approval_code = transaction.hmo_approval_code;
                balance.transaction_details = transaction.transaction_details;
                balance.patient = transaction.patient;
                balance.staff = transaction.staff;
                balance.service = transaction.service;
                balance.patientRequestItem = transaction.patientRequestItem;
                balance.appointment = transaction.appointment;
                balance.transaction_type = transaction.transaction_type;
                balance.balance = ((transaction.amount * -1) - amount_paid) * -1;
                balance.status = -1;
                balance.part_payment_expiry_date = date;
                balance.hmo = transaction.hmo;
                await balance.save();
            }

            transaction.amount_paid = amount_paid;
            transaction.payment_method = payment_method;
            if (payment_method === 'Voucher') {
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

            transaction.balance = 0;

            let queue;
            if (transaction.next_location && transaction.next_location === 'vitals') {
                // find appointment
                console.log(transaction.id);
                const appointment = await this.appointmentRepository.findOne({
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

            transaction.next_location = null;
            transaction.status = 1;
            transaction.lastChangedBy = updatedBy;
            const rs = await transaction.save();

            rs.staff = await getStaff(transaction.lastChangedBy);

            return { success: true, transaction: rs, queue };
        } catch (error) {
            console.log(error);
            return { success: false, message: error.message };
        }
    }

    async processBulkTransaction(transactionDto: ProcessTransactionDto, updatedBy): Promise<any> {
        const { payment_method, items } = transactionDto;
        try {
            let transactions = [];
            for (const item of items) {
                const transaction = await this.transactionsRepository.findOne(item.id, { relations: ['patient', 'staff', 'appointment', 'hmo'] });

                transaction.amount_paid = item.amount;
                transaction.balance = 0;

                let queue;
                if (transaction.next_location && transaction.next_location === 'vitals') {
                    // find appointment
                    const appointment = await this.appointmentRepository.findOne({
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

                transaction.next_location = null;
                transaction.status = 1;
                transaction.payment_method = payment_method;
                transaction.lastChangedBy = updatedBy;
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

    async creditAccount(params, createdBy): Promise<any> {
        try {
            const { patient_id, amount, payment_method } = params;

            const patient = await this.patientRepository.findOne(patient_id, { relations: ['hmo'] });

            const transaction = new Transactions();
            transaction.amount = amount;
            transaction.patient = patient;
            transaction.description = 'credit account';
            transaction.bill_source = 'credit';
            transaction.payment_type = 'self';
            transaction.payment_method = payment_method || 'Cash';
            transaction.transaction_type = 'credit';
            transaction.status = 1;
            transaction.hmo = patient.hmo;
            transaction.createdBy = createdBy;
            transaction.lastChangedBy = createdBy;
            const rs = await this.transactionsRepository.save(transaction);

            rs.staff = await getStaff(transaction.lastChangedBy);

            const allTransactions = await this.transactionsRepository.createQueryBuilder('t').select('t.*')
              .where('t.patient_id = :id', { id: patient.id })
              .getRawMany();

            const outstanding = allTransactions.filter(t => t.status !== 1 && t.payment_type === 'self')
              .reduce((sumTotal, item) => sumTotal + item.balance, 0);

            const totalAmount = allTransactions.reduce((sumTotal, item) => sumTotal + item.amount, 0);

            return { success: true, transaction: rs, outstanding, total_amount: totalAmount };
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
}
