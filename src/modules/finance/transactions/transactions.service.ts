import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionsRepository } from './transactions.repository';
import * as moment from 'moment';
import { PatientRepository } from '../../patient/repositories/patient.repository';
import { Transactions } from './transaction.entity';
import { TransactionDto } from './dto/transaction.dto';
import { DepartmentRepository } from '../../settings/departments/department.repository';
import { ServiceRepository } from '../../settings/services/service.repository';
import { Patient } from '../../patient/entities/patient.entity';
import { Service } from '../../settings/entities/service.entity';
import { Department } from '../../settings/entities/department.entity';
import { ProcessTransactionDto } from './dto/process-transaction.dto';
import { VoucherRepository } from '../vouchers/voucher.repository';
import { StaffRepository } from '../../hr/staff/staff.repository';
import { Pagination, PaginationOptionsInterface } from '../../../common/paginate';
import { getConnection } from 'typeorm-seeding';
import { Appointment } from '../../frontdesk/appointment/appointment.entity';
import { QueueSystemRepository } from '../../frontdesk/queue-system/queue-system.repository';

@Injectable()
export class TransactionsService {

    constructor(
        @InjectRepository(TransactionsRepository)
        private transactionsRepository: TransactionsRepository,
        @InjectRepository(PatientRepository)
        private patientRepository: PatientRepository,
        @InjectRepository(DepartmentRepository)
        private departmentRepository: DepartmentRepository,
        @InjectRepository(ServiceRepository)
        private serviceRepository: ServiceRepository,
        @InjectRepository(VoucherRepository)
        private voucherRepository: VoucherRepository,
        @InjectRepository(StaffRepository)
        private staffRepository: StaffRepository,
        @InjectRepository(QueueSystemRepository)
        private queueSystemRepository: QueueSystemRepository,
    ) {}

    async fetchList(options: PaginationOptionsInterface, params): Promise<Transactions[]> {
        const {startDate, endDate, patient_id, staff_id, status, payment_type, transaction_type} = params;

        const query = this.transactionsRepository.createQueryBuilder('q')
        .where('q.transaction_type = :type', {type: transaction_type});

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
            query.andWhere('q.patient_id = :patient_id', {patient_id});
        }

        if (staff_id && staff_id !== '') {
            query.andWhere('q.staff_id = :staff_id', {staff_id});
        }

        if (status) {
            query.andWhere('q.status = :status', {status});
        }

        const transactions = await query.take(options.limit).skip(options.page * options.limit).getRawMany();

        for (const transaction of transactions) {
            if (transaction.q_department_id) {
                const department = await this.departmentRepository.findOne(transaction.q_department_id);
                transaction.department = department;
            }

            if (transaction.q_staff_id) {
                const staff = await this.staffRepository.findOne(transaction.q_staff_id);
                transaction.staff = staff;
            }

            if (transaction.q_patient_id) {
                const patient = await this.patientRepository.findOne(transaction.q_patient_id);
                transaction.patient = patient;
            }

            if (transaction.q_service_id) {
                const service = await this.serviceRepository.findOne(transaction.q_service_id);
                transaction.service = service;
            }
        }

        return transactions;
    }

    async fetchDashboardTransactions() {
        const startOfDay = moment().startOf('day').toISOString();
        const endOfDay   = moment().endOf('day').toISOString();
        const dailyTotal = await this.transactionsRepository.createQueryBuilder('transaction')
                                    .where('transaction.transaction_type = :type', {type: 'billing'})
                                    .andWhere(`transaction.createdAt >= '${startOfDay}'`)
                                    .andWhere(`transaction.createdAt <= '${endOfDay}'`)
                                    .select('SUM(amount) as amount')
                                    .getRawOne();
        const unpaidTotal = await this.transactionsRepository.createQueryBuilder('transaction')
                                    .where('transaction.transaction_type = :type', {type: 'billing'})
                                    .andWhere(`transaction.createdAt >= '${startOfDay}'`)
                                    .andWhere(`transaction.createdAt <= '${endOfDay}'`)
                                    .andWhere('transaction.status = :status', {status: 0})
                                    .select('SUM(amount) as amount')
                                    .getRawOne();
        const totalCash = await this.transactionsRepository.createQueryBuilder('transaction')
                                    .where('transaction.transaction_type = :type', {type: 'billing'})
                                    .andWhere(`transaction.createdAt >= '${startOfDay}'`)
                                    .andWhere(`transaction.createdAt <= '${endOfDay}'`)
                                    .andWhere('transaction.status = :status', {status: 1})
                                    .andWhere('transaction.payment_type = :type', {type: 'Cash'})
                                    .select('SUM(amount) as amount')
                                    .getRawOne();
        const totalPOS = await this.transactionsRepository.createQueryBuilder('transaction')
                                    .where('transaction.transaction_type = :type', {type: 'billing'})
                                    .andWhere(`transaction.createdAt >= '${startOfDay}'`)
                                    .andWhere(`transaction.createdAt <= '${endOfDay}'`)
                                    .andWhere('transaction.status = :status', {status: 1})
                                    .andWhere('transaction.payment_type = :type', {type: 'POS'})
                                    .select('SUM(amount) as amount')
                                    .getRawOne();
        const totalCheque = await this.transactionsRepository.createQueryBuilder('transaction')
                                    .where('transaction.transaction_type = :type', {type: 'billing'})
                                    .andWhere(`transaction.createdAt >= '${startOfDay}'`)
                                    .andWhere(`transaction.createdAt <= '${endOfDay}'`)
                                    .andWhere('transaction.status = :status', {status: 1})
                                    .andWhere('transaction.payment_type = :type', {type: 'Cheque'})
                                    .select('SUM(amount) as amount')
                                    .getRawOne();
        const totalOutstanding = await this.transactionsRepository.createQueryBuilder('transaction')
                                    .where('transaction.transaction_type = :type', {type: 'billing'})
                                    .andWhere(`transaction.createdAt >= '${startOfDay}'`)
                                    .andWhere(`transaction.createdAt <= '${endOfDay}'`)
                                    .andWhere('transaction.status = :status', {status: 1})
                                    .select('SUM(balance) as amount')
                                    .getRawOne();
        return {dailyTotal, unpaidTotal, totalCash, totalPOS, totalCheque, totalOutstanding};
    }

    async listDashboardTransactions(params) {
        const {transactionType } = params;
        const startOfDay = moment().startOf('day').toISOString();
        const endOfDay   = moment().endOf('day').toISOString();
        const query = this.transactionsRepository.createQueryBuilder('transaction')
                            .innerJoin(Patient, 'patient', 'transaction.patient_id = patient.id')
                            .addSelect('patient.surname, patient.other_names')
                            .where('transaction.transaction_type = :type', {type: 'billing'})
                            .andWhere(`transaction.createdAt >= '${startOfDay}'`)
                            .andWhere(`transaction.createdAt <= '${endOfDay}'`);
        let result;
        switch (transactionType) {
            case 'daily-total':
                result = await query.getRawMany();
                break;
            case 'total-unpaid':
                result = await query.where('transaction.status = :status', {status: 0}).getRawMany();
                break;
            case 'total-cash':
                result = await query.where('transaction.status = :status', {status: 1})
                                    .andWhere('transaction.payment_type = :type', {type: 'Cash'})
                                    .getRawMany();
                break;
            case 'total-pos':
                result = await query.where('transaction.status = :status', {status: 1})
                                    .andWhere('transaction.payment_type = :type', {type: 'POS'})
                                    .getRawMany();
                break;
            case 'total-cheque':
                result = await query.where('transaction.status = :status', {status: 1})
                                    .andWhere('transaction.payment_type = :type', {type: 'Cheque'})
                                    .getRawMany();
                break;
            case 'total-outstanding':
                result = await query.where('transaction.status = :status', {status: 1})
                                    .andWhere('transaction.balance > :balance', {balance: 0})
                                    .getRawMany();
                break;
            default:
                break;
        }
        return result;
    }

    async save(transactionDto: TransactionDto): Promise<any> {
        const {patient_id, department_id, serviceType, amount, description, payment_type} = transactionDto;
        // find patient record
        const patient = await this.patientRepository.findOne(patient_id);
        // find service record
        const service = await this.serviceRepository.findOne(serviceType);
        // find department record
        const department = await this.departmentRepository.findOne(department_id);
        try {
            const transaction = await this.transactionsRepository.save({
                patient,
                serviceType: service,
                department,
                amount,
                description,
                payment_type,
                transaction_type: 'billing',
            });
            return {success: true, transaction };
        } catch (error) {
            return {success: false, message: error.message };
        }
    }

    async update(id: string, transactionDto: TransactionDto): Promise<any> {
        const {patient_id, department_id, serviceType, amount, description, payment_type} = transactionDto;
        // find patient record
        const patient = await this.patientRepository.findOne(patient_id);
        // find service record
        const service = await this.serviceRepository.findOne(serviceType);
        // find department record
        const department = await this.departmentRepository.findOne(department_id);
        try {
            const transaction = await this.transactionsRepository.findOne(id);
            transaction.patient     = patient;
            transaction.serviceType = service;
            transaction.department  = department;
            transaction.amount      = amount;
            transaction.description = description;
            transaction.payment_type= payment_type;
            await transaction.save();

            return {success: true, transaction };
        } catch (error) {
            return {success: false, message: error.message };
        }
    }

    async processTransaction(id: string, transactionDto: ProcessTransactionDto): Promise<any> {
        const {voucher_id, amount_paid, voucher_amount, payment_type} = transactionDto;
        try {
            const transaction = await this.transactionsRepository.findOne(id, {relations: ['department']});
            transaction.amount_paid = amount_paid;
            transaction.payment_type  = payment_type;
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
            transaction.status = 1;
            await transaction.save();
            // find appointment
            const appointment = await getConnection().getRepository(Appointment).findOne({
                where: {patient: transaction.patient, status: 'Pending Paypoint Approval'},
            });
            let queue;
            if (appointment) {
                // get paypoint department
                const department = await getConnection().getRepository(Department).findOne({where: {name: transaction.department.name}});
                // create new queue
                queue = await this.queueSystemRepository.saveQueue(appointment, department);
            }
            return {success: true, transaction, queue};
        } catch (error) {
            return {success: false, message: error.message };
        }
    }

    async delete(id: string): Promise<void> {
        const result = await this.transactionsRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Transaction with ID '${id}' not found`);
        }
    }

    async getTransaction(id: string): Promise<Transactions> {
        const result = await this.transactionsRepository.findOne({where: {id}, relations: ['items']});

        if (!result) {
            throw new NotFoundException(`Transaction with ID '${id}' not found`);
        }

        return result;
    }

    async cafeteriaDailyTotal() {
        const startOfDay = moment().startOf('day').toISOString();
        const endOfDay   = moment().endOf('day').toISOString();
        const query = await this.transactionsRepository.createQueryBuilder('transaction')
                                .where('transaction.transaction_type = :type', {type: 'cafeteria'})
                                .andWhere(`transaction.createdAt >= '${startOfDay}'`)
                                .andWhere(`transaction.createdAt <= '${endOfDay}'`)
                                .select('SUM(amount) as amount')
                                .getRawOne();
        return query;
    }
}
