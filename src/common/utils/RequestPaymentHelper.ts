import { getConnection } from 'typeorm';
import { Transactions } from '../../modules/finance/transactions/transaction.entity';
import { Patient } from '../../modules/patient/entities/patient.entity';
import { Stock } from '../../modules/inventory/entities/stock.entity';
import { PatientRequestItem } from '../../modules/patient/entities/patient_request_items.entity';
import { PatientRequest } from '../../modules/patient/entities/patient_requests.entity';

export class RequestPaymentHelper {
    static async clinicalLabPayment(labRequests, patient: Patient, createdBy) {
        let requests = [];
        let payments = [];

        for (const request of labRequests) {
            const labRequest = await getConnection().getRepository(PatientRequest).findOne(request.id, { relations: ['items'] });

            const labRequestItem = await getConnection().getRepository(PatientRequestItem).findOne(labRequest.items[0].id);

            const labTest = labRequestItem.labTest;

            const data = {
                patient,
                amount: parseFloat(labTest.hmoPrice),
                description: 'Payment for clinical lab',
                payment_type: (patient.hmo.name !== 'Private') ? 'HMO' : '',
                hmo_approval_status: (patient.hmo.name !== 'Private') ? 1 : 0,
                transaction_type: 'lab',
                transaction_details: labTest,
                createdBy,
                status: 0,
                patientRequestItem: labRequestItem,
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

    static async servicePayment(patientRequests, patient: Patient, createdBy) {
        let requests = [];
        let payments = [];

        for (const request of patientRequests) {
            const radiologyRequest = await getConnection().getRepository(PatientRequest).findOne(request.id, { relations: ['items'] });

            const radiologyRequestItem = await getConnection().getRepository(PatientRequestItem).findOne(radiologyRequest.items[0].id);

            const service = radiologyRequestItem.service;

            const data = {
                patient,
                amount: parseFloat(service.hmoTarrif),
                description: 'Payment for radiology',
                payment_type: (patient.hmo.name !== 'Private') ? 'HMO' : '',
                hmo_approval_status: (patient.hmo.name !== 'Private') ? 1 : 0,
                transaction_type: 'radiology',
                transaction_details: service,
                createdBy,
                status: 0,
                patientRequestItem: radiologyRequestItem,
            };

            const result = await this.save(data);
            const payment = result.generatedMaps[0];

            payments = [...payments, payment];
            requests = [...requests, { ...request, transaction: payment }];
        }

        return { request: requests, transactions: payments };
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
