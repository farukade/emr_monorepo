import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable, Logger } from '@nestjs/common';
import { getConnection, MoreThan } from 'typeorm';
import { Patient } from '../patient/entities/patient.entity';
import * as moment from 'moment';
import { Transactions } from '../finance/transactions/transaction.entity';

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);

    @Cron(CronExpression.EVERY_HOUR)
    async runEveryHour() {
        this.logger.debug('remove credit limits');
        try {
            const patients = await getConnection().getRepository(Patient).find({
                where: { creditLimit: MoreThan(0) },
            });

            for (const patient of patients) {
                const expiryDate = moment(patient.credit_limit_expiry_date, 'YYYY-MM-DD');
                if (moment().isSameOrAfter(expiryDate, 'day')) {
                    await getConnection()
                        .createQueryBuilder()
                        .update(Patient)
                        .set({ credit_limit: 0, credit_limit_expiry_date: null })
                        .where('id = :id', { id: patient.id })
                        .execute();
                }
            }
        } catch (e) {
            this.logger.error(e);
        }

        this.logger.debug('change part payments to pay now');
        try {
            const transactions = await getConnection().getRepository(Transactions).find({
                where: { status: -1 },
            });

            for (const item of transactions) {
                const expiryDate = moment(item.part_payment_expiry_date, 'YYYY-MM-DD');
                if (moment().isSameOrAfter(expiryDate, 'day')) {
                    await getConnection()
                        .createQueryBuilder()
                        .update(Transactions)
                        .set({ status: 0, part_payment_expiry_date: null })
                        .where('id = :id', { id: item.id })
                        .execute();
                }
            }
        } catch (e) {
            this.logger.error(e);
        }
    }
}
