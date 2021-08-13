import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable, Logger } from '@nestjs/common';
import { getConnection, MoreThan } from 'typeorm';
import { Patient } from '../patient/entities/patient.entity';
import * as moment from 'moment';
import { Transactions } from '../finance/transactions/transaction.entity';
import { Admission } from '../patient/admissions/entities/admission.entity';
import { HmoScheme } from '../hmo/entities/hmo_scheme.entity';
import { ServiceCost } from '../settings/entities/service_cost.entity';

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);

    @Cron(CronExpression.EVERY_HOUR)
    async runEveryHour() {
        this.logger.debug('remove credit limits');
        try {
            const patients = await getConnection().getRepository(Patient).find({
                where: { credit_limit: MoreThan(0) },
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

    @Cron(CronExpression.EVERY_DAY_AT_NOON)
    async runEveryDayAtNoon() {
        try {
            this.logger.debug('add new payment for room');

            const admissions = await getConnection().getRepository(Admission).find({
                where: { status: 0 },
            });

            for (const item of admissions) {
                const roomAssignedAt = moment(item.room_assigned_at);
                if (moment().isAfter(roomAssignedAt, 'day')) {
                    const transaction = await getConnection().getRepository(Transactions)
                        .createQueryBuilder('t')
                        .select('t.*')
                        .andWhere('t.bill_source = :source', { source: 'ward' })
                        .andWhere('t.admission_id = :id', { id: item.id })
                        .getRawOne();

                    if (transaction) {
                        const count = await getConnection().getRepository(Transactions).count(
                            { admission: item, bill_source: 'ward' },
                        );

                        // save transaction
                        const data = {
                            patient: await getConnection().getRepository(Patient).findOne(transaction.patient_id),
                            service: await getConnection().getRepository(ServiceCost).findOne(transaction.service_cost_id),
                            amount: transaction.amount,
                            balance: transaction.amount * -1,
                            description: `${transaction.description.split(' - ')[0]} - Day ${count + 1}`,
                            payment_type: transaction.payment_type,
                            transaction_type: 'debit',
                            is_admitted: true,
                            bill_source: 'ward',
                            hmo: await getConnection().getRepository(HmoScheme).findOne(transaction.hmo_scheme_id),
                            admission: item,
                        };

                        await getConnection().createQueryBuilder().insert().into(Transactions).values(data).execute();
                    }
                }
            }
        } catch (e) {
            this.logger.error(e);
        }
    }
}
