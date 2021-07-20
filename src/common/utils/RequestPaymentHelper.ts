import { getConnection } from 'typeorm';
import { Transactions } from '../../modules/finance/transactions/transaction.entity';
import { Patient } from '../../modules/patient/entities/patient.entity';
import { PatientRequestItem } from '../../modules/patient/entities/patient_request_items.entity';
import { PatientRequest } from '../../modules/patient/entities/patient_requests.entity';
import { ServiceCost } from '../../modules/settings/entities/service_cost.entity';
import { HmoScheme } from '../../modules/hmo/entities/hmo_scheme.entity';
import { ServiceCategory } from '../../modules/settings/entities/service_category.entity';
import { Admission } from '../../modules/patient/admissions/entities/admission.entity';

export class RequestPaymentHelper {
    static async clinicalLabPayment(labRequests, patient: Patient, createdBy, bill) {
        let requests = [];
        let payments = [];

        for (const request of labRequests) {
            const labRequest = await getConnection().getRepository(PatientRequest).findOne(request.id, { relations: ['item'] });

            const labRequestItem = await getConnection().getRepository(PatientRequestItem).findOne(labRequest.item.id);

            let hmo = patient.hmo;

            const labTest = labRequestItem.labTest;

            let serviceCost = await getConnection().getRepository(ServiceCost).findOne({
                where: { code: labTest.code, hmo },
            });

            if (!serviceCost || (serviceCost && serviceCost.tariff === 0)) {
                hmo = await getConnection().getRepository(HmoScheme).findOne({ where: { name: 'Private' } });
                serviceCost = await getConnection().getRepository(ServiceCost).findOne({
                    where: { code: labTest.code, hmo },
                });
            }

            const category = await getConnection().getRepository(ServiceCategory).findOne({ where: { name: 'labs' } });

            const admission = await getConnection().getRepository(Admission).findOne({ where: { patient } });

            const data = {
                patient,
                amount: serviceCost.tariff,
                description: 'Payment for clinical lab',
                payment_type: (hmo.name !== 'Private') ? 'HMO' : '',
                bill_source: category.name,
                service: serviceCost,
                createdBy,
                status: bill,
                patientRequestItem: labRequestItem,
                hmo,
                is_admitted: (admission !== null),
                transaction_type: 'debit',
                balance: serviceCost.tariff * -1,
            };

            const result = await this.save(data);
            const payment = result.generatedMaps[0];

            const transaction = await getConnection().getRepository(Transactions).findOne(payment.id);

            labRequestItem.transaction = transaction;
            await labRequestItem.save();

            payments = [...payments, transaction];

            requests = [...requests, { ...request, item: { ...labRequestItem, transaction } }];
        }

        return { labRequest: requests, transactions: payments };
    }

    static async servicePayment(patientRequests, patient: Patient, createdBy, requestType, bill) {
        let requests = [];
        let payments = [];

        for (const request of patientRequests) {
            const labRequest = await getConnection().getRepository(PatientRequest).findOne(request.id, { relations: ['item'] });

            const patientRequestItem = await getConnection().getRepository(PatientRequestItem).findOne(labRequest.item.id);

            let hmo = patient.hmo;

            const service = patientRequestItem.service;

            let serviceCost = await getConnection().getRepository(ServiceCost).findOne({
                where: { code: service.code, hmo },
            });

            if (!serviceCost || (serviceCost && serviceCost.tariff === 0)) {
                hmo = await getConnection().getRepository(HmoScheme).findOne({ where: { name: 'Private' } });
                serviceCost = await getConnection().getRepository(ServiceCost).findOne({
                    where: { code: service.code, hmo },
                });
            }

            const admission = await getConnection().getRepository(Admission).findOne({ where: { patient } });

            const data = {
                patient,
                amount: serviceCost.tariff,
                description: `Payment for ${requestType}`,
                payment_type: (hmo.name !== 'Private') ? 'HMO' : '',
                bill_source: requestType,
                service: serviceCost,
                createdBy,
                status: bill,
                patientRequestItem,
                hmo,
                is_admitted: (admission !== null),
                transaction_type: 'debit',
                balance: serviceCost.tariff * -1,
            };

            const result = await this.save(data);
            const payment = result.generatedMaps[0];

            const transaction = await getConnection().getRepository(Transactions).findOne(payment.id);

            patientRequestItem.transaction = transaction;
            await patientRequestItem.save();

            payments = [...payments, transaction];

            requests = [...requests, { ...request, item: { ...patientRequestItem, transaction } }];
        }

        return { request: requests, transactions: payments };
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
