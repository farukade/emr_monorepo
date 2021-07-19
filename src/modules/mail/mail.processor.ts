import { MailerService } from '@nestjs-modules/mailer';
import { OnQueueActive, OnQueueCompleted, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import * as moment from 'moment';
import { formatPID, sendSMS } from '../../common/utils/utils';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { LoggerRepository } from '../logger/logger.repository';
import { LogEntity } from '../logger/entities/logger.entity';

@Processor(process.env.MAIL_QUEUE_NAME)
export class MailProcessor {
    private readonly logger = new Logger(this.constructor.name);

    constructor(
        private readonly mailerService: MailerService,
        @InjectRepository(LoggerRepository)
        private loggerRepository: LoggerRepository,
    ) {
    }

    @OnQueueActive()
    onActive(job: Job) {
        this.logger.debug(`Processing job ${job.id} of type ${job.name}. Data: ${JSON.stringify(job.data)}`);
    }

    @OnQueueCompleted()
    onComplete(job: Job, result: any) {
        this.logger.debug(`Completed job ${job.id} of type ${job.name}. Result: ${JSON.stringify(result)}`);
    }

    @OnQueueFailed()
    onError(job: Job<any>, error: any) {
        this.logger.error(`Failed job ${job.id} of type ${job.name}: ${error.message}`, error.stack);
    }

    @Process('registration')
    async sendWelcomeEmail(job: Job<any>): Promise<any> {
        const data = job.data;

        this.logger.log(`Sending confirmation email to '${data.email}'`);

        try {
            if (process.env.DEBUG === 'false') {
                await sendSMS(data.phoneNumber, data.message);
            }
        } catch (error) {
            console.log(error);
            this.logger.error(`Failed to send sms to '${data.phoneNumber}'`, error.stack);
        }

        try {
            await this.mailerService.sendMail({
                to: data.email,
                from: '"DEDA Hospital" <info@dedahospital.com>', // override default from
                subject: 'Welcome to Deda Hospital',
                template: 'registration',
                context: {
                    name: data.name,
                    patientId: formatPID(data.id),
                    date: moment(data.createdAt).format('DD-MMM-YYYY'),
                    logo: `${process.env.ENDPOINT}/public/images/logo.png`,
                },
            });

        } catch (error) {
            console.log(error);

            const log = new LogEntity();
            log.email = data.email;
            log.type = 'email';
            log.category = 'registration';
            log.status = 'failed';
            log.errorMessage = error.message;
            log.data = data;

            await this.loggerRepository.save(log);

            this.logger.error(`Failed to send registration email to '${data.email}'`, error.stack);
        }
    }

    @Process('invoice')
    async sendInvoiceEmail(job: Job<any>): Promise<any> {
        const data = job.data;

        this.logger.log(`Sending invoice email to '${data.email}'`);

        try {
            return await this.mailerService.sendMail({
                to: data.email,
                from: '"DEDA Hospital" <info@dedahospital.com>', // override default from
                subject: 'Deda Hospital Invoice',
                template: 'invoice',
                context: {
                    name: data.name,
                    total: data.total,
                    address: data.address,
                    invoiceNumber: data.invoiceNumber,
                    email: data.email,
                    date: moment(data.createdAt).format('DD-MMM-YYYY h:mm a'),
                    logo: `${process.env.ENDPOINT}/public/images/logo.png`,
                },
            });

        } catch (error) {
            console.log(error);
            this.logger.error(`Failed to send registration email to '${data.email}'`, error.stack);
        }
    }

    @Process('regimen')
    async sendRegimenEmail(job: Job<any>): Promise<any> {
        const data = job.data;

        this.logger.log(`Sending confirmation email to '${data.email}'`);

        try {
            return await this.mailerService.sendMail({
                to: data.email,
                from: '"DEDA Hospital" <info@dedahospital.com>', // override default from
                subject: 'Drugs Purchase - Deda Pharmacy',
                template: 'pharmacy',
                context: {
                    name: data.name,
                    patientId: formatPID(data.id),
                    date: moment(data.createdAt).format('DD-MMM-YYYY'),
                    drugs: data.drugs,
                    logo: `${process.env.ENDPOINT}/public/images/logo.png`,
                },
            });

        } catch (error) {
            console.log(error);
            this.logger.error(`Failed to send registration email to '${data.email}'`, error.stack);
        }
    }

    @Process('discharge')
    async sendDischargeEmail(job: Job<any>): Promise<any> {
        const data = job.data;

        this.logger.log(`Sending confirmation email to '${data.email}'`);

        try {
            return await this.mailerService.sendMail({
                to: data.email,
                from: '"DEDA Hospital" <info@dedahospital.com>', // override default from
                subject: 'Pay Later Bill - Deda Hospital',
                template: 'discharge',
                context: {
                    name: data.name,
                    patientId: formatPID(data.id),
                    date: moment(data.createdAt).format('DD-MMM-YYYY'),
                    services: data.services,
                    logo: `${process.env.ENDPOINT}/public/images/logo.png`,
                },
            });

        } catch (error) {
            console.log(error);
            this.logger.error(`Failed to send registration email to '${data.email}'`, error.stack);
        }
    }
}
