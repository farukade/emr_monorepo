import { getConnection } from 'typeorm';
import { Transactions } from '../../modules/finance/transactions/transaction.entity';
import { ServiceRepository } from '../../modules/settings/services/service.repository';
import { LabTestRepository } from '../../modules/settings/lab/lab.test.repository';
import { Patient } from '../../modules/patient/entities/patient.entity';
import { StockRepository } from '../../modules/inventory/stock.repository';

export class RequestPaymentHelper {

    static labTestRepository = new LabTestRepository();
    static serviceRepository = new ServiceRepository();
    static stockRepository = new StockRepository();

    constructor() {}

    static async clinicalLabPayment(requestBody, patient: Patient, createdBy) {
        let totalAmount = 0;
        const items = [];
        // check if groups exist
        if (requestBody.groups.length) {
            for (const group of requestBody.groups) {
                // get test
                const test = await this.labTestRepository.findOne(group.service_id);
                totalAmount += parseFloat(test.price);
                items.push({name: test.name, amount: test.price});
            }
        }
        // check if tests
        if (requestBody.tests.length) {
            for (const test of requestBody.tests) {
                // get test
                const labTest = await this.labTestRepository.findOne(test.service_id);
                totalAmount += parseFloat(test.price);
                items.push({name: test.name, amount: test.price});
            }
        }
        const data = {
            patient,
            amount: totalAmount,
            description: 'Payment for clinical lab request',
            payment_type: (patient.hmo) ? 'HMO' : '',
            hmo_approval_stauts: (patient.hmo) ? 1 : 0,
            transaction_type: 'billing',
            transaction_details: items,
            createdBy,
        };
        const payment = await this.save(data);
        return {payment};
    }

    static async pharmacyPayment(requestBody, patient: Patient, createdBy) {
        let totalAmount = 0;
        const items = [];
        for (const body of requestBody) {
            const drug = await this.stockRepository.findOne(body.service_id);
            totalAmount += parseFloat(drug.sales_price);
            items.push({name: drug.name, amount: drug.sales_price});
        }
        const data = {
            patient,
            amount: totalAmount,
            description: 'Payment for pharmacy request',
            payment_type: (patient.hmo) ? 'HMO' : '',
            hmo_approval_stauts: (patient.hmo) ? 1 : 0,
            transaction_type: 'billing',
            transaction_details: items,
            createdBy,
        };
        const payment = await this.save(data);
        return {payment};
    }

    static async physiotherapyPayment(requestBody, patient: Patient, createdBy) { 
        let totalAmount = 0;
        const items = [];
        for (const body of requestBody) {
            const service = await this.serviceRepository.findOne(body.service_id);
            totalAmount += parseFloat(service.tariff);
            items.push({name: service.name, amount: service.tariff});
        }
        const data = {
            patient,
            amount: totalAmount,
            description: 'Payment for physiotherapy',
            payment_type: (patient.hmo) ? 'HMO' : '',
            hmo_approval_stauts: (patient.hmo) ? 1 : 0,
            transaction_type: 'billing',
            transaction_details: items,
            createdBy,
        };
        const payment = await this.save(data);
        return {payment};
    }

    static async opthalmologyPayment(requestBody, patient: Patient, createdBy) {
        const service = await this.serviceRepository.findOne(requestBody.service_id);
        const totalAmount = parseFloat(service.tariff);
        const item = {name: service.name, amount: service.tariff};

        const data = {
            patient,
            amount: totalAmount,
            description: 'Payment for Opthalmology',
            payment_type: (patient.hmo) ? 'HMO' : '',
            hmo_approval_stauts: (patient.hmo) ? 1 : 0,
            transaction_type: 'billing',
            transaction_details: item,
            createdBy,
        };
        const payment = await this.save(data);
        return {payment};
     }

    static async dentistryPayment(requestBody, patient: Patient, createdBy) {
        const service = await this.serviceRepository.findOne(requestBody.service_id);
        const totalAmount = parseFloat(service.tariff);
        const item = {name: service.name, amount: service.tariff};

        const data = {
            patient,
            amount: totalAmount,
            description: 'Payment for dentitry',
            payment_type: (patient.hmo) ? 'HMO' : '',
            hmo_approval_stauts: (patient.hmo) ? 1 : 0,
            transaction_type: 'billing',
            transaction_details: item,
            createdBy,
        };
        const payment = await this.save(data);
        return {payment};
    }

    static async imagingPayment(requestBody, patient: Patient, createdBy) {
        const service = await this.serviceRepository.findOne(requestBody.service_id);
        const totalAmount = parseFloat(service.tariff);
        const item = {name: service.name, amount: service.tariff};

        const data = {
            patient,
            amount: totalAmount,
            description: 'Payment for Radiology',
            payment_type: (patient.hmo) ? 'HMO' : '',
            hmo_approval_stauts: (patient.hmo) ? 1 : 0,
            transaction_type: 'billing',
            transaction_details: item,
            createdBy,
        };
        const payment = await this.save(data);
        return {payment};
    }

    static async procedurePayment(requestBody, patient: Patient, createdBy) {
        const service = await this.serviceRepository.findOne(requestBody.service_id);
        const totalAmount = parseFloat(service.tariff);
        const item = {name: service.name, amount: service.tariff};

        const data = {
            patient,
            amount: totalAmount,
            description: 'Payment for procedure',
            payment_type: (patient.hmo) ? 'HMO' : '',
            hmo_approval_stauts: (patient.hmo) ? 1 : 0,
            transaction_type: 'billing',
            transaction_details: item,
            createdBy,
        };
        const payment = await this.save(data);
        return {payment};
    }

    static async save(data) {
        await getConnection()
            .createQueryBuilder()
            .insert()
            .into(Transactions)
            .values(data)
            .execute();
    }
}
