import { getConnection } from 'typeorm';
import { Transaction } from '../../modules/finance/transactions/transaction.entity';
import { Patient } from '../../modules/patient/entities/patient.entity';
import { PatientRequestItem } from '../../modules/patient/entities/patient_request_items.entity';
import { PatientRequest } from '../../modules/patient/entities/patient_requests.entity';
import { ServiceCost } from '../../modules/settings/entities/service_cost.entity';
import { HmoScheme } from '../../modules/hmo/entities/hmo_scheme.entity';
import { ServiceCategory } from '../../modules/settings/entities/service_category.entity';
import { Admission } from '../../modules/patient/admissions/entities/admission.entity';
import { postDebit } from './utils';
import { TransactionCreditDto } from '../../modules/finance/transactions/dto/transaction-credit.dto';

export class RequestPaymentHelper {
	static async clinicalLabPayment(labRequests, patient: Patient, createdBy, bill) {
		let requests = [];
		let payments = [];

		for (const request of labRequests) {
			const labRequest = await getConnection().getRepository(PatientRequest).findOne(request.id, { relations: ['item'] });

			const labRequestItem = await getConnection().getRepository(PatientRequestItem).findOne(labRequest.item.id);

			const hmo = patient.hmo;

			const labTest = labRequestItem.labTest;
			if (labTest) {
				const serviceCost = await getConnection().getRepository(ServiceCost).findOne({
					where: { code: labTest.code, hmo },
				});

				const category = await getConnection().getRepository(ServiceCategory).findOne({
					where: { slug: 'labs' },
				});

				const admission = await getConnection().getRepository(Admission).findOne({
					where: { patient, status: 0 },
				});

				const data: TransactionCreditDto = {
					patient_id: patient.id,
					username: createdBy,
					sub_total: 0,
					vat: 0,
					amount: (serviceCost?.tariff || 0) * -1,
					voucher_amount: 0,
					amount_paid: 0,
					change: 0,
					description: 'Payment for clinical lab',
					payment_method: null,
					part_payment_expiry_date: null,
					bill_source: category.slug,
					next_location: null,
					status: bill,
					hmo_approval_code: null,
					transaction_details: null,
					admission_id: admission?.id || null,
					staff_id: null,
					lastChangedBy: null,
				};

				const payment = await postDebit(data, serviceCost, null, labRequestItem, null, hmo);

				const transaction = await getConnection().getRepository(Transaction).findOne(payment.id);

				labRequestItem.transaction = transaction;
				await labRequestItem.save();

				payments = [...payments, transaction];

				requests = [...requests, { ...request, item: { ...labRequestItem, transaction } }];
			}
		}

		return { labRequest: requests, transactions: payments };
	}

	static async servicePayment(patientRequests, patient: Patient, createdBy, requestType, bill) {
		let requests = [];
		let payments = [];

		for (const request of patientRequests) {
			const labRequest = await getConnection().getRepository(PatientRequest).findOne(request.id, { relations: ['item'] });

			const patientRequestItem = await getConnection().getRepository(PatientRequestItem).findOne(labRequest.item.id);

			const hmo = patient.hmo;

			const service = patientRequestItem.service;
			if (service) {
				const serviceCost = await getConnection().getRepository(ServiceCost).findOne({
					where: { code: service?.code, hmo },
				});

				const admission = await getConnection().getRepository(Admission).findOne({
					where: { patient, status: 0 },
				});

				const data: TransactionCreditDto = {
					patient_id: patient.id,
					username: createdBy,
					sub_total: 0,
					vat: 0,
					amount: (serviceCost?.tariff || 0) * -1,
					voucher_amount: 0,
					amount_paid: 0,
					change: 0,
					description: `Payment for ${requestType}`,
					payment_method: null,
					part_payment_expiry_date: null,
					bill_source: requestType,
					next_location: null,
					status: bill,
					hmo_approval_code: null,
					transaction_details: null,
					admission_id: admission?.id || null,
					staff_id: null,
					lastChangedBy: null,
				};

				const payment = await postDebit(data, serviceCost, null, patientRequestItem, null, hmo);

				const transaction = await getConnection().getRepository(Transaction).findOne(payment.id);

				patientRequestItem.transaction = transaction;
				await patientRequestItem.save();

				payments = [...payments, transaction];

				requests = [...requests, { ...request, item: { ...patientRequestItem, transaction } }];
			}
		}

		return { request: requests, transactions: payments };
	}
}
