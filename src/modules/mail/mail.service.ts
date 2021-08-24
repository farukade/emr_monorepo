import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class MailService {
    private readonly logger = new Logger(this.constructor.name);

    constructor(
        @InjectQueue(process.env.MAIL_QUEUE_NAME)
        private mailQueue: Queue,
    ) {
    }

    async sendMail(data: any, category: string): Promise<boolean> {
        try {
            await this.mailQueue.add(category, data);
            return true;
        } catch (error) {
            console.log(error);
            this.logger.error(`Error queueing confirmation email to user ${data.email}`);
            return false;
        }
    }
}
