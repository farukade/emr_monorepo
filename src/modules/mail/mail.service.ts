import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

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
                date: data.date,
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
                name: data.name,
                folderNumber: data.folderNumber,
                date: data.date,
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
                folderNumber: data.folderNumber,
                date: data.date,
                drugs: data.drugs,
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
                date: data.date,
                services: data.services,
            },
        });
    }
}
