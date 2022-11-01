import { OnQueueActive, OnQueueCompleted, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Job } from 'bull';
import { formatPID, s3Client, sendSMS, slugify } from '../../common/utils/utils';
import * as moment from 'moment';
import { LogEntity } from '../logger/entities/logger.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LoggerRepository } from '../logger/logger.repository';
import * as path from 'path';
import * as fs from 'fs';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getConnection } from 'typeorm';
import { PatientDocument } from '../patient/entities/patient_documents.entity';

@Processor(process.env.QUEUE_NAME)
export class QueueProcessor {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly mailerService: MailerService,
    @InjectRepository(LoggerRepository)
    private loggerRepository: LoggerRepository,
  ) {}

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(`Processing job ${job.id} of type ${job.name}`);
  }

  @OnQueueCompleted()
  onComplete(job: Job) {
    this.logger.debug(`Completed job ${job.id} of type ${job.name}`);
  }

  @OnQueueFailed()
  onError(job: Job<any>, error: any) {
    this.logger.error(`Failed job ${job.id} of type ${job.name}: ${error.message}`, error.stack);
  }

  @Process('send')
  async sendEmail(job: Job<any>): Promise<any> {
    const data = job.data;

    this.logger.log(`Sending email to '${data.to_email}'`);

    try {
      return await this.mailerService.sendMail({
        to: data.to_email,
        from: `"${data.from_name}" <${data.from_email || 'noreply@dedahospital.com'}>`,
        subject: data.subject,
        template: 'mail',
        context: {
          message: data.message,
          logo: `${process.env.ENDPOINT}/images/logo.png`,
        },
      });
    } catch (error) {
      console.log(error);
      this.logger.error(`Failed to send email to '${data.email}'`, error.stack);
    }
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
        from: '"DEDA Hospital" <noreply@dedahospital.com>', // override default from
        subject: 'Welcome to Deda Hospital',
        template: 'registration',
        context: {
          name: data.name,
          patientId: formatPID(data.id),
          date: moment(data.createdAt).format('DD-MMM-YYYY'),
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
        from: '"DEDA Hospital" <noreply@dedahospital.com>', // override default from
        subject: 'Deda Hospital Invoice',
        template: 'invoice',
        context: {
          name: data.name,
          total: data.total,
          address: data.address,
          invoiceNumber: data.invoiceNumber,
          email: data.email,
          date: moment(data.createdAt).format('DD-MMM-YYYY h:mm a'),
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
        from: '"DEDA Hospital" <noreply@dedahospital.com>', // override default from
        subject: 'Drugs Purchase - Deda Pharmacy',
        template: 'pharmacy',
        context: {
          name: data.name,
          patientId: formatPID(data.id),
          date: moment(data.createdAt).format('DD-MMM-YYYY'),
          drugs: data.drugs,
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
        from: '"DEDA Hospital" <noreply@dedahospital.com>', // override default from
        subject: 'Pay Later Bill - Deda Hospital',
        template: 'discharge',
        context: {
          name: data.name,
          patientId: formatPID(data.id),
          date: moment(data.createdAt).format('DD-MMM-YYYY'),
          services: data.services,
        },
      });
    } catch (error) {
      console.log(error);
      this.logger.error(`Failed to send registration email to '${data.email}'`, error.stack);
    }
  }

  @Process('upload-document')
  async uploadDocument(job: Job<any>): Promise<any> {
    try {
      const data = job.data;
      const filepath = path.resolve(__dirname, `../../../public/documents/${data.name}`);
      const file_type = slugify(data.type);
      const spaceKey = `documents/${data.patient_id}/${file_type}/${data.name}`;

      const params = {
        Bucket: 'deda-docs',
        Key: spaceKey,
        Body: fs.createReadStream(filepath),
        ACL: 'private',
      };

      await s3Client.send(new PutObjectCommand(params));

      const document = await getConnection().getRepository(PatientDocument).findOne(data.id);
      document.cloud_uri = spaceKey;
      await document.save();
    } catch (error) {
      console.log(error);
      this.logger.error('Failed to upload document', error.stack);
    }
  }

  @Process('appointment')
  async sendAppointmentReminder(job: Job<any>): Promise<any> {
    const data = job.data;

    this.logger.log(`Sending appointment reminder email to '${data.email}'`);

    try {
      if (process.env.DEBUG === 'false') {
        await sendSMS(data.phoneNumber, data.message);
      }
    } catch (error) {
      console.log(error);
      this.logger.error(`Failed to send sms to '${data.phoneNumber}'`, error.stack);
    }

    // try {
    //   await this.mailerService.sendMail({
    //     to: data.email,
    //     from: '"DEDA Hospital" <noreply@dedahospital.com>', // override default from
    //     subject: 'Welcome to Deda Hospital',
    //     template: 'appointment',
    //     context: {
    //       name: data.name,
    //       time: data.time,
    //       patientId: formatPID(data.id),
    //       date: moment(data.createdAt).format('DD-MMM-YYYY'),
    //       doctor: data.doctor,
    //     },
    //   });
    // } catch (error) {
    //   console.log(error);

    //   const log = new LogEntity();
    //   log.email = data.email;
    //   log.type = 'email';
    //   log.category = 'registration';
    //   log.status = 'failed';
    //   log.errorMessage = error.message;
    //   log.data = data;

    //   await this.loggerRepository.save(log);

    //   this.logger.error(`Failed to send registration email to '${data.email}'`, error.stack);
    // }
  }
}
