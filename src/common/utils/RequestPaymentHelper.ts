import { getConnection } from 'typeorm';
import { Transaction } from '../../modules/finance/transactions/transaction.entity';
import { Patient } from '../../modules/patient/entities/patient.entity';
import { PatientRequestItem } from '../../modules/patient/entities/patient_request_items.entity';
import { PatientRequest } from '../../modules/patient/entities/patient_requests.entity';
import { ServiceCost } from '../../modules/settings/entities/service_cost.entity';
import { ServiceCategory } from '../../modules/settings/entities/service_category.entity';
import { Admission } from '../../modules/patient/admissions/entities/admission.entity';
import { createServiceCost, postCredit, postDebit } from './utils';
import { TransactionCreditDto } from '../../modules/finance/transactions/dto/transaction-credit.dto';
import { Nicu } from '../../modules/patient/nicu/entities/nicu.entity';
import { AntenatalEnrollment } from '../../modules/patient/antenatal/entities/antenatal-enrollment.entity';
import { AntenatalPackage } from '../../modules/settings/entities/antenatal-package.entity';

export class RequestPaymentHelper {
  static async clinicalLabPayment(labRequests, patient: Patient, username, bill) {
    let requests = [];
    let payments = [];

    for (const request of labRequests) {
      const labRequest = await getConnection()
        .getRepository(PatientRequest)
        .findOne(request.id, { relations: ['item'] });

      const labRequestItem = await getConnection().getRepository(PatientRequestItem).findOne(labRequest.item.id);

      const hmo = patient.hmo;

      const labTest = labRequestItem.labTest;
      if (labTest) {
        let serviceCost = await getConnection()
          .getRepository(ServiceCost)
          .findOne({
            where: { code: labTest.code, hmo },
          });
        if (!serviceCost) {
          serviceCost = await createServiceCost(labTest.code, hmo);
        }

        const category = await getConnection()
          .getRepository(ServiceCategory)
          .findOne({
            where: { slug: 'labs' },
          });

        const admission = await getConnection()
          .getRepository(Admission)
          .findOne({
            where: { patient, status: 0 },
          });

        const nicu = await getConnection()
          .getRepository(Nicu)
          .findOne({
            where: { patient, status: 0 },
          });

        const ancEnrollment = await getConnection()
          .getRepository(AntenatalEnrollment)
          .findOne({ patient, status: 0 }, { relations: ['ancpackage'] });

        const amount = (serviceCost?.tariff || 0) * -1;

        const data: TransactionCreditDto = {
          patient_id: patient.id,
          username,
          sub_total: 0,
          vat: 0,
          amount,
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
          nicu_id: nicu?.id || null,
          staff_id: null,
          lastChangedBy: null,
        };

        const payment = await postDebit(data, serviceCost, null, labRequestItem, null, hmo);

        if (ancEnrollment) {
          const ancPackage = await getConnection().getRepository(AntenatalPackage).findOne(ancEnrollment.ancpackage?.id);

          if (ancPackage) {
            let items;
            try {
              const coverage = JSON.parse(ancPackage.coverage);
              items = coverage.labs;
            } catch (e) {
              items = ancPackage.coverage.labs;
            }

            const covered = items.find((i) => i.code === labTest.code);
            if (covered) {
              // credit paypoint
              const creditData: TransactionCreditDto = {
                patient_id: patient.id,
                username,
                sub_total: 0,
                vat: 0,
                amount: Math.abs(amount),
                voucher_amount: 0,
                amount_paid: Math.abs(amount),
                change: 0,
                description: payment.description,
                payment_method: 'ANC Covered',
                part_payment_expiry_date: null,
                bill_source: category.slug,
                next_location: null,
                status: 1,
                hmo_approval_code: null,
                transaction_details: null,
                admission_id: admission?.id || null,
                nicu_id: nicu?.id || null,
                staff_id: null,
                lastChangedBy: username,
              };

              // approve debit
              payment.next_location = null;
              payment.status = 1;
              payment.lastChangedBy = username;
              payment.amount_paid = Math.abs(amount);
              payment.payment_method = 'ANC Covered';
              await payment.save();

              await postCredit(creditData, payment.service, null, payment.patientRequestItem, null, hmo);
            }
          }
        }

        const transaction = await getConnection().getRepository(Transaction).findOne(payment.id);

        labRequestItem.transaction = transaction;
        await labRequestItem.save();

        payments = [...payments, transaction];

        requests = [...requests, { ...request, item: { ...labRequestItem, transaction } }];
      }
    }

    return { labRequest: requests, transactions: payments };
  }

  static async servicePayment(patientRequests, patient: Patient, username, requestType, bill) {
    let requests = [];
    let payments = [];

    for (const request of patientRequests) {
      const labRequest = await getConnection()
        .getRepository(PatientRequest)
        .findOne(request.id, { relations: ['item'] });

      const patientRequestItem = await getConnection().getRepository(PatientRequestItem).findOne(labRequest.item.id);

      const hmo = patient.hmo;

      const service = patientRequestItem.service;
      if (service && service.code) {
        let serviceCost = await getConnection()
          .getRepository(ServiceCost)
          .findOne({
            where: { code: service.code, hmo },
          });
        if (!serviceCost) {
          serviceCost = await createServiceCost(service.code, hmo);
        }

        const admission = await getConnection()
          .getRepository(Admission)
          .findOne({
            where: { patient, status: 0 },
          });

        const nicu = await getConnection()
          .getRepository(Nicu)
          .findOne({
            where: { patient, status: 0 },
          });

        const ancEnrollment = await getConnection().getRepository(AntenatalEnrollment).findOne({ patient, status: 0 });

        const amount = (serviceCost?.tariff || 0) * -1;

        const data: TransactionCreditDto = {
          patient_id: patient.id,
          username,
          sub_total: 0,
          vat: 0,
          amount,
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
          nicu_id: nicu?.id || null,
          staff_id: null,
          lastChangedBy: null,
        };

        const payment = await postDebit(data, serviceCost, null, patientRequestItem, null, hmo);

        if (ancEnrollment) {
          const ancPackage = await getConnection().getRepository(AntenatalPackage).findOne(ancEnrollment.ancpackage?.id);

          if (ancPackage) {
            const coverage = ancPackage.coverage;

            const keys = Object.keys(coverage);
            const values: any[] = Object.values(coverage);
            const index = keys.findIndex((i) => i === requestType);
            const items = values[index];
            const covered = items?.find((i) => i.code === service.code);

            if (covered) {
              // credit paypoint
              const creditData: TransactionCreditDto = {
                patient_id: patient.id,
                username,
                sub_total: 0,
                vat: 0,
                amount: Math.abs(amount),
                voucher_amount: 0,
                amount_paid: Math.abs(amount),
                change: 0,
                description: payment.description,
                payment_method: 'ANC Covered',
                part_payment_expiry_date: null,
                bill_source: requestType,
                next_location: null,
                status: 1,
                hmo_approval_code: null,
                transaction_details: null,
                admission_id: admission?.id || null,
                nicu_id: nicu?.id || null,
                staff_id: null,
                lastChangedBy: username,
              };

              // approve debit
              payment.next_location = null;
              payment.status = 1;
              payment.lastChangedBy = username;
              payment.amount_paid = Math.abs(amount);
              payment.payment_method = 'ANC Covered';
              await payment.save();

              await postCredit(creditData, payment.service, null, payment.patientRequestItem, null, hmo);
            }
          }
        }

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
