import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionsRepository } from './transactions.repository';
import * as moment from 'moment';
import { PatientRepository } from '../../patient/repositories/patient.repository';
import { Transactions } from './transaction.entity';

@Injectable()
export class TransactionsService {

    constructor(
        @InjectRepository(TransactionsRepository)
        private transactionsRepository: TransactionsRepository,
        @InjectRepository(PatientRepository)
        private patientRepository: PatientRepository,
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
}
