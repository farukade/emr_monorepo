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
    ) {}

    async fetchList(params): Promise<Transactions[]> {
        const {startDate, endDate, patient_id, status, payment_type} = params;

        const query = this.transactionsRepository.createQueryBuilder('q')
        .innerJoin('q.patient', 'patient')
        .leftJoin('q.department', 'department')
        .leftJoin('q.serviceType', 'service')
        .addSelect('patient.surname, patient.other_names, department.name as deptName, service.name as serviceName');

        if (startDate && startDate !== '') {
            const start = moment(startDate).endOf('day').toISOString();
            query.where(`q.createdAt >= '${start}'`);
        }
        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.where(`q.createdAt <= '${end}'`);
        }
        if (payment_type && payment_type !== '') {
            query.where(`q.payment_type = '${payment_type}'`);
        }
        if (patient_id && patient_id !== '') {
            query.where('q.patient_id = :patient_id', {patient_id});
        }

        if (status) {
            query.where('q.status = :status', {status});
        }

        const result = await query.getRawMany();

        return result;
    }

    async fetchDashboardTransactions() {
        const startOfDay = moment().startOf('day').toISOString();
        const endOfDay   = moment().endOf('day').toISOString();
        const dailyTotal = await this.transactionsRepository.createQueryBuilder('transaction')
                                    .where(`transaction.createdAt >= '${startOfDay}'`)
                                    .andWhere(`transaction.createdAt <= '${endOfDay}'`)
                                    .select('SUM(amount) as amount')
                                    .getRawOne();
        const unpaidTotal = await this.transactionsRepository.createQueryBuilder('transaction')
                                    .where(`transaction.createdAt >= '${startOfDay}'`)
                                    .andWhere(`transaction.createdAt <= '${endOfDay}'`)
                                    .andWhere('transaction.status = :status', {status: 0})
                                    .select('SUM(amount) as amount')
                                    .getRawOne();
        const totalCash = await this.transactionsRepository.createQueryBuilder('transaction')
                                    .where(`transaction.createdAt >= '${startOfDay}'`)
                                    .andWhere(`transaction.createdAt <= '${endOfDay}'`)
                                    .andWhere('transaction.status = :status', {status: 1})
                                    .andWhere('transaction.payment_type = :type', {type: 'Cash'})
                                    .select('SUM(amount) as amount')
                                    .getRawOne();
        const totalPOS = await this.transactionsRepository.createQueryBuilder('transaction')
                                    .where(`transaction.createdAt >= '${startOfDay}'`)
                                    .andWhere(`transaction.createdAt <= '${endOfDay}'`)
                                    .andWhere('transaction.status = :status', {status: 1})
                                    .andWhere('transaction.payment_type = :type', {type: 'POS'})
                                    .select('SUM(amount) as amount')
                                    .getRawOne();
        const totalCheque = await this.transactionsRepository.createQueryBuilder('transaction')
                                    .where(`transaction.createdAt >= '${startOfDay}'`)
                                    .andWhere(`transaction.createdAt <= '${endOfDay}'`)
                                    .andWhere('transaction.status = :status', {status: 1})
                                    .andWhere('transaction.payment_type = :type', {type: 'Cheque'})
                                    .select('SUM(amount) as amount')
                                    .getRawOne();
        const totalOutstanding = await this.transactionsRepository.createQueryBuilder('transaction')
                                    .where(`transaction.createdAt >= '${startOfDay}'`)
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
                                    .where(`transaction.createdAt >= '${startOfDay}'`)
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
            const transaction = await this.transactionsRepository.findOne(id);
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

            return {success: true, transaction };
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
}
