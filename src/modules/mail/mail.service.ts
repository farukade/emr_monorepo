import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { formatPID } from '../../common/utils/utils';
import * as moment from 'moment';

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) {
    }

    async sendInvoice(data: any) {
        await this.mailerService.sendMail({
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
                date: moment(data.createdAt).format('DD-MMM-YYYY'),
                logo: `${process.env.ENDPOINT}/public/images/logo.png`,
            },
        });
    }

    async regMail(data: any) {
        await this.mailerService.sendMail({
            to: data.email,
            from: '"DEDA Hospital" <info@dedahospital.com>', // override default from
            subject: 'Welcome to Deda Hospital',
            template: 'reg',
            context: {
                name: `${data.other_names} ${data.surname}`,
                folderNumber: formatPID(data.id),
                date: moment(data.createdAt).format('DD-MMM-YYYY'),
                logo: `${process.env.ENDPOINT}/public/images/logo.png`,
            },
        });
    }

    async pharmacyMail(data: any) {
        await this.mailerService.sendMail({
            to: data.email,
            from: '"DEDA Hospital" <info@dedahospital.com>', // override default from
            subject: 'Drugs Purchase - Deda Pharmacy',
            template: 'pharmacy',
            context: {
                name: data.name,
                folderNumber: formatPID(data.id),
                date: moment(data.createdAt).format('DD-MMM-YYYY'),
                drugs: data.drugs,
                logo: `${process.env.ENDPOINT}/public/images/logo.png`,
            },
        });
    }

    async dischargeMail(data: any) {
        await this.mailerService.sendMail({
            to: data.email,
            from: '"DEDA Hospital" <info@dedahospital.com>', // override default from
            subject: 'Pay Later Bill - Deda Hospital',
            template: 'discharge',
            context: {
                name: data.name,
                folderNumber: data.folderNumber,
                date: moment(data.createdAt).format('DD-MMM-YYYY'),
                services: data.services,
                logo: `${process.env.ENDPOINT}/public/images/logo.png`,
            },
        });
    }
}
