import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NicuRepository } from './nicu.repository';
import { StaffRepository } from '../../hr/staff/staff.repository';
import { PatientRepository } from '../repositories/patient.repository';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { Pagination } from '../../../common/paginate/paginate.interface';
import * as moment from 'moment';
import { AdmissionsRepository } from '../admissions/repositories/admissions.repository';
import { getConnection } from 'typeorm';
import { NicuAccommodationRepository } from '../../settings/nicu-accommodation/accommodation.repository';
import { TransactionsRepository } from '../../finance/transactions/transactions.repository';
import { TransactionCreditDto } from '../../finance/transactions/dto/transaction-credit.dto';
import { postDebit } from '../../../common/utils/utils';

@Injectable()
export class NicuService {
    constructor(
        @InjectRepository(NicuRepository)
        private nicuRepository: (NicuRepository),
        @InjectRepository(StaffRepository)
        private staffRepository: StaffRepository,
        @InjectRepository(AdmissionsRepository)
        private admissionsRepository: AdmissionsRepository,
        @InjectRepository(PatientRepository)
        private patientRepository: PatientRepository,
        @InjectRepository(NicuAccommodationRepository)
        private nicuAccommodationRepository: NicuAccommodationRepository,
        @InjectRepository(TransactionsRepository)
        private transactionsRepository: TransactionsRepository,
    ) {
    }

    async getEnrollments(options: PaginationOptionsInterface, params): Promise<Pagination> {
        const { startDate, endDate, patient_id, status, type, name } = params;
        const query = this.nicuRepository.createQueryBuilder('q')
            .leftJoinAndSelect('q.patient', 'patient')
            .select('q.id, q.createdAt as admission_date, q.createdBy as admitted_by, q.status, q.accommodation_id')
            .addSelect('CONCAT(patient.other_names || \' \' || patient.surname) as patient_name, patient.id as patient_id, patient.gender as patient_gender');

        if (startDate && startDate !== '') {
            const start = moment(startDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt >= '${start}'`);
        }

        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt <= '${end}'`);
        }

        if (patient_id && patient_id !== '') {
            query.andWhere('q.patient = :patient_id', { patient_id });
        }

        if (status) {
            query.andWhere('q.status = :status', { status });
        }

        if (name) {
            query.where('q.patient_name like :name', { name: `%${name}%` });
        }

        const page = options.page - 1;

        const admissions = await query.offset(page * options.limit)
            .limit(options.limit)
            .orderBy('q.createdAt', 'DESC')
            .getRawMany();

        const total = await query.getCount();

        let result = [];
        for (const item of admissions) {
            if (item.patient_id) {
                item.patient = await this.patientRepository.findOne(item.patient_id, { relations: ['nextOfKin', 'immunization', 'hmo'] });
            }

            item.admission = await this.admissionsRepository.findOne(item.admission_id);

            if (item.accommodation_id) {
                item.accommodation = await this.nicuAccommodationRepository.findOne(item.accommodation_id);
            }

            result = [...result, item];
        }

        return {
            result,
            lastPage: Math.ceil(total / options.limit),
            itemsPerPage: options.limit,
            totalPages: total,
            currentPage: options.page,
        };
    }

    async saveAccommodation(id, params, username: string) {
        try {
            const { accommodation_id, patient_id } = params;

            // find admission
            const nicu = await this.nicuRepository.findOne(id, { relations: ['patient'] });
            const admission = await this.admissionsRepository.findOne({ nicu });

            // find patient
            const patient = await this.patientRepository.findOne(patient_id, { relations: ['hmo'] });

            // find accommodation
            const accommodation = await this.nicuAccommodationRepository.findOne(accommodation_id);
            if (accommodation.quantity_unused <= 0) {
                return { success: false, message: `all ${accommodation.name}s are occupied` };
            }

            // save room
            accommodation.quantity_unused = accommodation.quantity_unused - 1;
            await accommodation.save();

            // update admission with room
            nicu.accommodation = accommodation;
            nicu.accommodation_assigned_at = moment().format('YYYY-MM-DD HH:mm:ss');
            nicu.accommodation_assigned_by = username;
            const rs = await nicu.save();

            // find service cost
            const amount = accommodation.amount;

            // save transaction
            const data: TransactionCreditDto = {
                patient_id: patient.id,
                username,
                sub_total: 0,
                vat: 0,
                amount: amount * -1,
                voucher_amount: 0,
                amount_paid: 0,
                change: 0,
                description: `Nicu Accommodation: ${accommodation.name} - Day 1`,
                payment_method: null,
                part_payment_expiry_date: null,
                bill_source: 'nicu-accommodation',
                next_location: null,
                status: -1,
                hmo_approval_code: null,
                transaction_details: null,
                admission_id: admission.id,
                staff_id: null,
                lastChangedBy: null,
            };

            await postDebit(data, null, null, null, null, patient.hmo);

            return { success: true, nicu: rs };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }
}
