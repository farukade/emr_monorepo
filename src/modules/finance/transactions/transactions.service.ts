import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionsRepository } from './transactions.repository';
import * as moment from 'moment';
import { PatientRepository } from '../../patient/repositories/patient.repository';
import { Transactions } from './transaction.entity';
import { TransactionDto } from './dto/transaction.dto';
import { DepartmentRepository } from '../../settings/departments/department.repository';
import { ServiceRepository } from '../../settings/services/service.repository';

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
    ) {}

    async fetchList(params): Promise<Transactions[]> {
        const {startDate, endDate, patient_id, status} = params;
        const query = this.transactionsRepository.createQueryBuilder('q');
        if (startDate && startDate !== '') {
            const start = moment(startDate).endOf('day').toISOString();
            query.where(`q.createdAt >= '${start}'`);
        }
        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.where(`q.createdAt <= '${end}'`);
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

    async save(transactionDto: TransactionDto): Promise<any> {
        const {patient_id, department_id, serviceType, amount, description} = transactionDto;
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
            });
            return {success: true, transaction };
        } catch (error) {
            return {success: false, message: error.message };
        }
    }

    async update(id: string, transactionDto: TransactionDto): Promise<any> {
        const {patient_id, department_id, serviceType, amount, description} = transactionDto;
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
