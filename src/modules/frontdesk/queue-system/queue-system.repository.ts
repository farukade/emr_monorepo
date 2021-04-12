import { Repository, EntityRepository } from 'typeorm';
import { Queue } from './queue.entity';
import { Appointment } from '../appointment/appointment.entity';
import { Department } from '../../settings/entities/department.entity';
import * as moment from 'moment';

@EntityRepository(Queue)
export class QueueSystemRepository extends Repository<Queue> {

    async saveQueue(appointment: Appointment, type: string): Promise<Queue> {
        try {
            let queueNumber;
            const today = moment().format('YYYY-MM-DD');
            const lastQueueRes = await this.find({
                where: {queueDate: today, queueType: type},
                take: 1,
                order: {queueNumber: 'DESC'},
            });
            if (lastQueueRes.length) {
                // check if last queue date is today
                const lastQueue = lastQueueRes[0];
                queueNumber = lastQueue.queueNumber + 1;
            } else {
                queueNumber = 1;
            }
            const queue = new Queue();
            queue.queueNumber   = queueNumber;
            queue.patientName   = appointment.patient.surname + ', ' + appointment.patient.other_names;
            queue.appointment   = appointment;
            queue.status        = 1;
            queue.queueDate     = today;
            queue.queueType     = type;
            await queue.save();

            return queue;
        } catch (e) {
            console.log(e.message);
        }
    }
}
