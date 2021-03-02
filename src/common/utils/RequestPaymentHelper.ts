import { getConnection } from 'typeorm';
import { Transactions } from '../../modules/finance/transactions/transaction.entity';
import { ServiceRepository } from '../../modules/settings/services/service.repository';
import { LabTestRepository } from '../../modules/settings/lab/lab.test.repository';
import { Patient } from '../../modules/patient/entities/patient.entity';
import { StockRepository } from '../../modules/inventory/stock.repository';
import { Service } from '../../modules/settings/entities/service.entity';
import { Stock } from '../../modules/inventory/entities/stock.entity';
import { LabTest } from '../../modules/settings/entities/lab_test.entity';

export class RequestPaymentHelper {

    static labTestRepository = new LabTestRepository();
    static serviceRepository = new ServiceRepository();
    static stockRepository = new StockRepository();

    static async clinicalLabPayment(labRequests, patient: Patient, createdBy) {
        let requests = [];
        let payments = [];
        for (const request of labRequests) {
            // get test
            const labTest = await getConnection().getRepository(LabTest).findOne(request.requestBody.id);

            const data = {
                patient,
                amount: parseFloat(labTest.price),
                description: 'Payment for clinical lab',
                payment_type: (patient.hmo.name !== 'Private') ? 'HMO' : '',
                hmo_approval_status: (patient.hmo.name !== 'Private') ? 1 : 0,
                transaction_type: 'lab',
                transaction_details: labTest,
                createdBy,
                status: 0,
                patientRequest: request,
            };

            const result = await this.save(data);
            const payment = result.generatedMaps[0];

            payments = [...payments, payment];
            requests = [...requests, { ...request, transaction: payment }];
        }

        return { labRequest: requests, transactions: payments };
    }

    static async pharmacyPayment(requestBody, patient: Patient, createdBy) {
        let totalAmount = 0;
        const items = [];
        for (const body of requestBody) {
            const drug = await getConnection().getRepository(Stock).findOne(body.drug_id);
            totalAmount += parseFloat(drug.sales_price);
            items.push({ name: drug.name, amount: drug.sales_price });
        }
        const data = {
            patient,
            amount: totalAmount,
            description: 'Payment for pharmacy request',
            payment_type: (patient.hmo.name !== 'Private') ? 'HMO' : '',
            hmo_approval_status: (patient.hmo.name !== 'Private') ? 1 : 0,
            transaction_type: 'billing',
            transaction_details: items,
            createdBy,
        };
        const payment = await this.save(data);
        return { payment: payment.generatedMaps[0] };
    }

    static async physiotherapyPayment(requestBody, patient: Patient, createdBy) {
        let totalAmount = 0;
        const items = [];
        for (const body of requestBody) {
            const service = await getConnection().getRepository(Service).findOne(body.service_id);
            totalAmount += parseFloat(service.tariff);
            items.push({ name: service.name, amount: service.tariff });
        }
        const data = {
            patient,
            amount: totalAmount,
            description: 'Payment for physiotherapy',
            payment_type: (patient.hmo.name !== 'Private') ? 'HMO' : '',
            hmo_approval_status: (patient.hmo.name !== 'Private') ? 1 : 0,
            transaction_type: 'billing',
            transaction_details: items,
            createdBy,
        };
        const payment = await this.save(data);
        return { payment: payment.generatedMaps[0] };
    }

    static async opthalmologyPayment(requestBody, patient: Patient, createdBy) {
        let totalAmount = 0;
        const items = [];
        for (const body of requestBody) {
            const service = await getConnection().getRepository(Service).findOne(body.service_id);
            totalAmount += parseFloat(service.tariff);
            items.push({ name: service.name, amount: service.tariff });
        }

        const data = {
            patient,
            amount: totalAmount,
            description: 'Payment for Opthalmology',
            payment_type: (patient.hmo.name !== 'Private') ? 'HMO' : '',
            hmo_approval_status: (patient.hmo.name !== 'Private') ? 1 : 0,
            transaction_type: 'billing',
            transaction_details: items,
            createdBy,
        };
        const payment = await this.save(data);
        return { payment: payment.generatedMaps[0] };
    }

    static async dentistryPayment(requestBody, patient: Patient, createdBy) {
        let totalAmount = 0;
        const items = [];
        for (const body of requestBody) {
            const service = await getConnection().getRepository(Service).findOne(body.service_id);
            totalAmount += parseFloat(service.tariff);
            items.push({ name: service.name, amount: service.tariff });
        }

        const data = {
            patient,
            amount: totalAmount,
            description: 'Payment for dentitry',
            payment_type: (patient.hmo.name !== 'Private') ? 'HMO' : '',
            hmo_approval_status: (patient.hmo.name !== 'Private') ? 1 : 0,
            transaction_type: 'billing',
            transaction_details: items,
            createdBy,
        };
        const payment = await this.save(data);
        return { payment: payment.generatedMaps[0] };
    }

    static async imagingPayment(requestBody, patient: Patient, createdBy) {
        let totalAmount = 0;
        const items = [];
        for (const body of requestBody) {
            items.push({ name: body.service_name, amount: body.amount });
        }

        const data = {
            patient,
            amount: totalAmount,
            description: 'Payment for Radiology',
            payment_type: (patient.hmo.name !== 'Private') ? 'HMO' : '',
            hmo_approval_status: (patient.hmo.name !== 'Private') ? 1 : 0,
            transaction_type: 'billing',
            transaction_details: items,
            createdBy,
        };
        const payment = await this.save(data);
        return { payment: payment.generatedMaps[0] };
    }

    static async procedurePayment(requestBody, patient: Patient, createdBy) {
        let totalAmount = 0;
        const items = [];
        for (const body of requestBody) {
            items.push({ name: body.service_name, amount: body.amount });
            totalAmount += parseFloat(body.amount);
        }

        const data = {
            patient,
            amount: totalAmount,
            description: 'Payment for procedure',
            payment_type: (patient.hmo.name !== 'Private') ? 'HMO' : '',
            hmo_approval_status: (patient.hmo.name !== 'Private') ? 1 : 0,
            transaction_type: 'billing',
            transaction_details: items,
            createdBy,
        };
        const payment = await this.save(data);
        return { payment: payment.generatedMaps[0] };
    }

    static async save(data) {
        return await getConnection()
            .createQueryBuilder()
            .insert()
            .into(Transactions)
            .values(data)
            .execute();
    }
}
