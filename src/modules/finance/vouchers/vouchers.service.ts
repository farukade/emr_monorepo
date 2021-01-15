import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VoucherRepository } from './voucher.repository';
import * as moment from 'moment';
import { PatientRepository } from '../../patient/repositories/patient.repository';
import { Voucher } from './voucher.entity';
import { VoucherDto } from './dto/voucher.dto';
import { DepartmentRepository } from '../../settings/departments/department.repository';
import { ServiceRepository } from '../../settings/services/service.repository';
import { Patient } from '../../patient/entities/patient.entity';
import { Service } from '../../settings/entities/service.entity';
import { Department } from '../../settings/entities/department.entity';
import { TransactionsRepository } from '../transactions/transactions.repository';
import { User } from '../../hr/entities/user.entity';
import { StaffDetails } from '../../hr/staff/entities/staff_details.entity';

@Injectable()
export class VouchersService {

    constructor(
        @InjectRepository(PatientRepository)
        private patientRepository: PatientRepository,
        @InjectRepository(VoucherRepository)
        private voucherRepository: VoucherRepository,
        @InjectRepository(TransactionsRepository)
        private transactionsRepository: TransactionsRepository,
    ) {
    }

    async fetchList(params): Promise<Voucher[]> {
        const { startDate, endDate, patient_id, status } = params;
        const query = this.voucherRepository.createQueryBuilder('q')
            .innerJoin('q.patient', 'patient')
            .leftJoin(User, 'creator', 'q.createdBy = creator.username')
            // .innerJoin(User, 'updator', 'q.lastChangedBy = updator.username')
            .innerJoin(StaffDetails, 'staff1', 'staff1.user_id = creator.id')
            // .innerJoin(StaffDetails, 'staff2', 'staff2.user_id = updator.id')
            .select('q.id, q.voucher_no, q.amount, q.amount_used')
            .addSelect('CONCAT(staff1.first_name || \' \' || staff1.last_name) as created_by, staff1.id as created_by_id')
            // .addSelect('CONCAT(staff2.first_name || \' \' || staff2.last_name) as updated_by, staff2.id as updated_by_id')
            .addSelect('CONCAT(patient.surname || \' \' || patient.other_names) as patient_name, patient.id as patient_id');

        if (startDate && startDate !== '') {
            const start = moment(startDate).endOf('day').toISOString();
            query.where(`q.createdAt >= '${start}'`);
        }
        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.where(`q.createdAt <= '${end}'`);
        }
        if (patient_id && patient_id !== '') {
            query.where('q.patient_id = :patient_id', { patient_id });
        }

        if (status) {
            query.where('q.status = :status', { status });
        }

        const result = await query.getRawMany();

        return result;
    }

    async save(voucherDto: VoucherDto, createdBy): Promise<any> {
        const { patient_id, amount, duration, voucher_no, transaction_id, start_date } = voucherDto;

        // find patient record
        const patient = await this.patientRepository.findOne(patient_id);
        if (!patient) {
            return { success: false, message: 'select patient' };
        }

        try {
            const voucher = await this.voucherRepository.save({
                patient,
                amount,
                duration,
                voucher_no,
                createdBy,
                start_date,
            });
            if (transaction_id && transaction_id !== '') {
                await this.addVoucherToTransaction(voucher, transaction_id);
            }
            return { success: true, voucher };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async update(id: string, voucherDto: VoucherDto, updatedBy): Promise<any> {
        const { patient_id, amount, duration, voucher_no } = voucherDto;
        // find patient record
        const patient = await this.patientRepository.findOne(patient_id);

        try {
            const voucher = await this.voucherRepository.findOne(id);
            voucher.patient = patient;
            voucher.amount = amount;
            voucher.duration = duration;
            voucher.voucher_no = voucher_no;
            voucher.lastChangedBy = updatedBy;
            await voucher.save();

            return { success: true, voucher };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async delete(id: string): Promise<void> {
        const result = await this.voucherRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Voucher with ID '${id}' not found`);
        }
    }

    async addVoucherToTransaction(voucher, transaction_id) {
        const transaction = await this.transactionsRepository.findOne(transaction_id);
        transaction.voucher = voucher;
        await transaction.save();
    }
}
