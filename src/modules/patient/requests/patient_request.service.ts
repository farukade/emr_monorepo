import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../auth/entities/user.entity';
import { StaffDetails } from '../../hr/staff/entities/staff_details.entity';
import * as moment from 'moment';
import { PatientRequestHelper } from '../../../common/utils/PatientRequestHelper';
import { RequestPaymentHelper } from '../../../common/utils/RequestPaymentHelper';
import { PatientRequestRepository } from '../repositories/patient_request.repository';
import { PatientRequestItemRepository } from '../repositories/patient_request_items.repository';
import { PatientRepository } from '../repositories/patient.repository';
import { TransactionsRepository } from '../../finance/transactions/transactions.repository';
import { AppGateway } from '../../../app.gateway';
import { getConnection } from 'typeorm';
import { Transactions } from '../../finance/transactions/transaction.entity';
import { AdmissionClinicalTask } from '../admissions/entities/admission-clinical-task.entity';
import { generatePDF } from '../../../common/utils/utils';
import { AdmissionsRepository } from '../admissions/repositories/admissions.repository';
import * as path from 'path';
import { Drug } from '../../inventory/entities/drug.entity';
import { DrugBatch } from '../../inventory/entities/batches.entity';
import { HmoSchemeRepository } from '../../hmo/repositories/hmo_scheme.repository';

@Injectable()
export class PatientRequestService {
    constructor(
        private readonly appGateway: AppGateway,
        @InjectRepository(PatientRequestRepository)
        private patientRequestRepository: PatientRequestRepository,
        @InjectRepository(HmoSchemeRepository)
        private hmoSchemeRepository: HmoSchemeRepository,
        @InjectRepository(PatientRequestItemRepository)
        private patientRequestItemRepository: PatientRequestItemRepository,
        @InjectRepository(PatientRepository)
        private patientRepository: PatientRepository,
        @InjectRepository(TransactionsRepository)
        private transactionsRepository: TransactionsRepository,
        @InjectRepository(AdmissionsRepository)
        private admissionRepository: AdmissionsRepository,
    ) {

    }

    async listRequests(requestType, urlParams): Promise<any> {
        const { startDate, endDate, status, page, limit, today } = urlParams;

        const queryLimit = limit ? parseInt(limit, 10) : 30;
        const offset = (page ? parseInt(page, 10) : 1) - 1;

        const query = this.patientRequestRepository.createQueryBuilder('q')
            .leftJoin('q.patient', 'patient')
            .leftJoin(User, 'creator', 'q.createdBy = creator.username')
            .innerJoin(StaffDetails, 'staff1', 'staff1.user_id = creator.id')
            .select('q.id, q.requestType, q.code, q.createdAt, q.status, q.urgent, q.requestNote')
            .addSelect('CONCAT(staff1.first_name || \' \' || staff1.last_name) as created_by, staff1.id as created_by_id')
            .addSelect('CONCAT(patient.other_names || \' \' || patient.surname) as patient_name, patient.id as patient_id')
            .where('q.requestType = :requestType', { requestType });

        if (startDate && startDate !== '') {
            const start = moment(startDate).startOf('day').format('YYYY-MM-DD HH:mm:ss');
            query.andWhere(`q.createdAt >= '${start}'`);
        }
        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').format('YYYY-MM-DD HH:mm:ss');
            query.andWhere(`q.createdAt <= '${end}'`);
        }

        if (today && today !== '') {
            query.andWhere(`CAST(q.createdAt as text) LIKE '%${today}%'`);
        }

        if (status === 'Completed') {
            query.andWhere('q.status = :status', { status: 1 });
        }

        const count = await query.getCount();

        const items = await query.orderBy({
            'q.urgent': 'DESC',
            'q.createdAt': 'DESC',
        }).limit(queryLimit).offset(offset * queryLimit).getRawMany();

        let result = [];
        for (const item of items) {
            const request = await this.patientRequestRepository.findOne({ where: { id: item.id }, relations: ['item'] });

            const patient = await this.patientRepository.findOne(item.patient_id, {
                relations: ['nextOfKin', 'immunization', 'hmo'],
            });

            const transaction = await this.transactionsRepository.findOne({
                where: { patientRequestItem: request.item },
            });

            result = [...result, { ...item, ...request, patient, transaction }];
        }

        return {
            result,
            lastPage: Math.ceil(count / queryLimit),
            itemsPerPage: queryLimit,
            totalPages: count,
            currentPage: page,
        };
    }

    async listPatientRequests(requestType, patient_id, urlParams): Promise<any> {
        const { startDate, endDate, filled, page, limit, today, type, item_id } = urlParams;

        const queryLimit = limit ? parseInt(limit, 10) : 30;
        const offset = (page ? parseInt(page, 10) : 1) - 1;

        const query = this.patientRequestRepository.createQueryBuilder('q')
            .leftJoin('q.patient', 'patient')
            .leftJoin(User, 'creator', 'q.createdBy = creator.username')
            .innerJoin(StaffDetails, 'staff1', 'staff1.user_id = creator.id')
            .select('q.id, q.requestType, q.code, q.createdAt, q.status, q.urgent, q.requestNote')
            .addSelect('CONCAT(staff1.first_name || \' \' || staff1.last_name) as created_by, staff1.id as created_by_id')
            .addSelect('CONCAT(patient.surname || \' \' || patient.other_names) as patient_name, patient.id as patient_id')
            .where('q.patient_id = :patient_id', { patient_id })
            .andWhere('q.requestType = :requestType', { requestType });

        if (startDate && startDate !== '') {
            const start = moment(startDate).startOf('day').format('YYYY-MM-DD HH:mm:ss');
            query.andWhere(`q.createdAt >= '${start}'`);
        }
        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').format('YYYY-MM-DD HH:mm:ss');
            query.andWhere(`q.createdAt <= '${end}'`);
        }

        if (today && today !== '') {
            query.andWhere(`CAST(q.createdAt as text) LIKE '%${today}%'`);
        }

        if (type && type === 'procedure') {
            query.andWhere('q.procedureId = :item_id', { item_id });
        }

        if (type && type === 'antenatal') {
            query.andWhere('q.antenatalId = :item_id', { item_id });
        }

        const count = await query.getCount();

        const items = await query.orderBy({
            'q.urgent': 'DESC',
            'q.createdAt': 'DESC',
        }).limit(queryLimit).offset(offset * queryLimit).getRawMany();

        let result = [];
        for (const item of items) {
            const request = await this.patientRequestRepository.findOne({ where: { id: item.id }, relations: ['item'] });

            const patient = await this.patientRepository.findOne(item.patient_id, {
                relations: ['nextOfKin', 'immunization', 'hmo'],
            });

            const transaction = await this.transactionsRepository.findOne({
                where: { patientRequestItem: request.item },
            });

            result = [...result, { ...item, ...request, patient, transaction }];
        }

        return {
            result,
            lastPage: Math.ceil(count / queryLimit),
            itemsPerPage: queryLimit,
            totalPages: count,
            currentPage: page,
        };
    }

    async doSaveRequest(param, createdBy) {
        const { requestType, patient_id } = param;
        if (!requestType && requestType === '') {
            return { success: false, message: 'Request Type cannot be empty' };
        }
        let res = {};
        const patient = await this.patientRepository.findOne(patient_id, { relations: ['hmo'] });
        switch (requestType) {
            case 'labs':
                // save request
                let labRequest = await PatientRequestHelper.handleLabRequest(param, patient, createdBy);
                if (labRequest.success) {
                    // save transaction
                    const payment = await RequestPaymentHelper.clinicalLabPayment(labRequest.data, patient, createdBy, param.pay_later);
                    // @ts-ignore
                    labRequest = { ...payment.labRequest };

                    this.appGateway.server.emit('paypoint-queue', { payment: payment.transactions });
                }
                res = labRequest;
                break;
            case 'drugs':
                let pharmacyReq = await PatientRequestHelper.handlePharmacyRequest(param, patient, createdBy);
                if (pharmacyReq.success) {
                    pharmacyReq = { ...pharmacyReq };
                }
                res = pharmacyReq;
                break;
            case 'scans':
                let request = await PatientRequestHelper.handleServiceRequest(param, patient, createdBy, requestType);
                if (request.success) {
                    // save transaction
                    const payment = await RequestPaymentHelper.servicePayment(request.data, patient, createdBy, requestType, param.pay_later);

                    // @ts-ignore
                    request = { ...payment.request };

                    this.appGateway.server.emit('paypoint-queue', { payment: payment.transactions });
                }
                res = request;
                break;
            case 'procedure':
                let procedure = await PatientRequestHelper.handleServiceRequest(param, patient, createdBy, requestType);
                if (procedure.success) {
                    // save transaction
                    const payment = await RequestPaymentHelper.servicePayment(procedure.data, patient, createdBy, requestType, param.bill);

                    // @ts-ignore
                    procedure = { ...payment.request };

                    this.appGateway.server.emit('paypoint-queue', { payment: payment.transactions });
                }
                res = procedure;
                break;

            case 'vaccines':
                let immunizationReq = await PatientRequestHelper.handleVaccinationRequest(param, patient, createdBy);
                if (immunizationReq.success) {
                    // save transaction
                    immunizationReq = { ...immunizationReq };
                }
                res = immunizationReq;
                break;
            default:
                res = { success: false, message: 'No data' };
                break;
        }
        return res;
    }

    async receiveSpecimen(id: number, username: string) {
        try {
            const request = await this.patientRequestRepository.findOne(id, { relations: ['item'] });

            const item = await this.patientRequestItemRepository.findOne(request.item.id);
            item.received = 1;
            item.receivedBy = username;
            item.receivedAt = moment().format('YYYY-MM-DD HH:mm:ss');
            item.lastChangedBy = username;
            const rs = await item.save();

            return { success: true, data: rs };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }

    async doFillRequest(param, requestId, updatedBy) {
        const { patient_id, total_amount, items } = param;
        try {
            const request = await this.patientRequestRepository.findOne(requestId, { relations: ['item'] });

            const patient = await this.patientRepository.findOne(patient_id, {
                relations: ['nextOfKin', 'immunization', 'hmo'],
            });

            for (const item of items) {
                const batch = await getConnection().getRepository(DrugBatch).findOne(item.batch_id);
                const drug = await getConnection().getRepository(Drug).findOne(batch.drug.id);
                const requestItem = await this.patientRequestItemRepository.findOne(item.id);
                requestItem.drugBatch = batch;
                requestItem.drugGeneric = drug.generic;
                requestItem.filled = 1;
                requestItem.fillQuantity = item.fillQuantity;
                requestItem.filledAt = moment().format('YYYY-MM-DD HH:mm:ss');
                requestItem.filledBy = updatedBy;
                requestItem.drug = drug;
                await requestItem.save();
            }

            // save transaction
            const data = {
                patient,
                amount: total_amount,
                description: 'Payment for pharmacy request',
                payment_type: patient.hmo.id === 1 ? '' : 'HMO',
                bill_source: 'pharmacy',
                transaction_type: 'debit',
                balance: total_amount * -1,
                // tslint:disable-next-line:max-line-length
                transaction_details: items.map(i => ({
                    id: i.id,
                    drug: i.drug,
                    note: i.note,
                    dose_quantity: i.dose_quantity,
                    refills: i.refills,
                    frequency: i.frequency,
                    frequencyType: i.frequencyType,
                    duration: i.duration,
                    external_prescription: i.external_prescription,
                    vaccine: i.vaccine,
                })),
                createdBy: updatedBy,
                request,
                hmo: patient.hmo,
            };

            const payment = await getConnection()
                .createQueryBuilder()
                .insert()
                .into(Transactions)
                .values(data)
                .execute();

            const transaction = { ...payment.generatedMaps[0] };

            const res = await request.save();

            this.appGateway.server.emit('paypoint-queue', transaction);

            const reqItems = await this.patientRequestItemRepository.find({ where: { request: res }, relations: ['diagnosis'] });

            return { success: true, data: { ...res, items: reqItems, transaction: payment.generatedMaps[0] } };
        } catch (e) {
            // console.log(e.message)
            return { success: false, message: e.message };
        }
    }

    async doApproveResult(id: number, params, username) {
        const { type } = params;

        const request = await this.patientRequestRepository.findOne(id, { relations: ['item'] });

        const item = await this.patientRequestItemRepository.findOne(request.item.id);

        switch (type) {
            case 'labs':
            case 'scans':
                try {
                    item.approved = 1;
                    item.approvedBy = username;
                    item.approvedAt = moment().format('YYYY-MM-DD HH:mm:ss');
                    item.lastChangedBy = username;
                    const rs = await item.save();

                    request.status = 1;
                    await request.save();

                    return { success: true, data: rs };
                } catch (e) {
                    return { success: false, message: e.message };
                }
            case 'drugs':
            default:
            // try {
            //     const patient = result.patient;
            //     const admission = await this.admissionRepository.findOne({ where: { patient } });
            //
            //     let resultItems = [];
            //     for (const item of result.items) {
            //         const requestItem = await this.patientRequestItemRepository.findOne(item.id, { relations: ['diagnosis'] });
            //
            //         requestItem.approved = 1;
            //         requestItem.approvedBy = username;
            //         requestItem.approvedAt = moment().format('YYYY-MM-DD HH:mm:ss');
            //         requestItem.lastChangedBy = username;
            //         const rs = await requestItem.save();
            //
            //         resultItems = [...resultItems, rs];
            //     }
            //
            //     let results = [];
            //     for (const item of result.items) {
            //         // @ts-ignore
            //         const { vaccine } = item;
            //         if (vaccine) {
            //             const newTask = new AdmissionClinicalTask();
            //
            //             newTask.task = 'Immunization';
            //             newTask.title = `Give ${item.drug.name} Immediately`;
            //             newTask.taskType = 'regimen';
            //             newTask.drug = { ...item.drug, vaccine };
            //             newTask.dose = 1;
            //             newTask.interval = 1;
            //             newTask.intervalType = 'immediately';
            //             newTask.frequency = 'Immediately';
            //             newTask.taskCount = 1;
            //             newTask.startTime = moment().format('YYYY-MM-DD HH:mm:ss');
            //             newTask.nextTime = moment().format('YYYY-MM-DD HH:mm:ss');
            //             newTask.patient = patient;
            //             newTask.admission = admission;
            //             newTask.createdBy = username;
            //             newTask.request = result;
            //
            //             const rs = await newTask.save();
            //             results = [...results, rs];
            //         }
            //     }
            //
            //     result.status = 1;
            //     result.lastChangedBy = username;
            //     const res = await result.save();
            //
            //     return { success: true, data: { ...res, items: resultItems } };
            // } catch (e) {
            //     return { success: false, message: e.message };
            // }
        }
    }

    async fillResult(id: string, param, username: string) {
        try {
            const { parameters, note, result } = param;

            const request = await this.patientRequestRepository.findOne(id, { relations: ['item'] });

            const item = await this.patientRequestItemRepository.findOne(request.item.id);
            item.filled = 1;
            item.filledBy = username;
            item.filledAt = moment().format('YYYY-MM-DD HH:mm:ss');
            item.parameters = parameters;
            item.note = note;
            item.result = result;
            item.lastChangedBy = username;
            const rs = await item.save();

            return { success: true, data: rs };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }

    async rejectResult(id: string, params, username: string) {
        try {
            const request = await this.patientRequestRepository.findOne(id, { relations: ['item'] });

            const item = await this.patientRequestItemRepository.findOne(request.item.id);
            item.filled = 0;
            item.filledBy = null;
            item.filledAt = null;
            item.parameters = item.parameters.map(p => ({
                ...p,
                inference: '',
                value: '',
            }));
            item.result = null;
            item.lastChangedBy = username;

            if (params.type === 'radiology') {
                item.document = null;
            }

            const rs = await item.save();

            return { success: true, data: rs };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }

    async scheduleProcedure(id: number, params, username: string) {
        try {
            const { resources, start_date, end_date } = params;

            const request = await this.patientRequestRepository.findOne(id, { relations: ['item'] });

            const item = await this.patientRequestItemRepository.findOne(request.item.id);
            item.resources = resources;
            item.scheduledDate = true;
            item.scheduledStartDate = start_date;
            item.scheduledEndDate = end_date;
            item.lastChangedBy = username;
            const rs = await item.save();

            return { success: true, data: rs };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }

    async startProcedure(id: number, params, username: string) {
        try {
            const { date } = params;

            const request = await this.patientRequestRepository.findOne(id, { relations: ['item'] });

            const item = await this.patientRequestItemRepository.findOne(request.item.id);
            item.startedDate = date;
            item.approved = 1;
            item.approvedBy = username;
            item.approvedAt = moment().format('YYYY-MM-DD HH:mm:ss');
            item.lastChangedBy = username;
            const rs = await item.save();

            request.status = 1;
            await request.save();

            return { success: true, data: rs };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }

    async endProcedure(id: number, params, username: string) {
        try {
            const { date } = params;

            const request = await this.patientRequestRepository.findOne(id, { relations: ['item'] });

            const item = await this.patientRequestItemRepository.findOne(request.item.id);
            item.finishedDate = date;
            item.filled = 1;
            item.filledBy = username;
            item.filledAt = moment().format('YYYY-MM-DD HH:mm:ss');
            item.lastChangedBy = username;
            const rs = await item.save();

            return { success: true, data: rs };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }

    async deleteRequest(id: string, params, username: string) {
        const { type } = params;
        const request = await this.patientRequestRepository.findOne(id, { relations: ['item'] });

        const item = await this.patientRequestItemRepository.findOne(request.item.id);

        item.cancelled = 1;
        item.cancelledBy = username;
        item.cancelledAt = moment().format('YYYY-MM-DD HH:mm:ss');
        item.lastChangedBy = username;
        item.deletedBy = username;
        const rs = await item.save();

        request.deletedBy = username;
        await request.save();

        try {
            const transaction = await this.transactionsRepository.findOne({ where: { patientRequestItem: item } });

            if (transaction.status === 1) {
                await this.transactionsRepository.save({
                    ...transaction,
                    transaction_type: 'credit',
                    balance: transaction.amount_paid,
                    amount_paid: 0,
                    status: 1,
                });
            }

            transaction.deletedBy = username;
            await transaction.save();
            await transaction.softRemove();
        } catch (e) {
            console.log(e);
        }

        await item.softRemove();

        await request.softRemove();

        return { success: true, data: rs };
    }

    async printResult(id: number, params) {
        try {
            const { print_group, type } = params;

            const request = await this.patientRequestRepository.findOne(id, { relations: ['patient', 'item'] });

            const patient = request.patient;

            // tslint:disable-next-line:prefer-const
            let results;
            const printGroup = parseInt(print_group, 10);
            if (printGroup === 1) {
                results = await this.patientRequestRepository.find({ where: { code: request.code }, relations: ['patient', 'item'] });
            } else {
                results = [request];
            }

            const specimen = [...results.map(r => r.item.labTest.specimens?.map(s => s.label))];

            const date = new Date();
            const filename = `${type}-${date.getTime()}.pdf`;
            const filepath = path.resolve(__dirname, `../../../../public/result/${filename}`);

            const dob = moment(patient.date_of_birth, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD');

            const data = {
                patient,
                date: moment(request.createdAt, 'YYYY-MM-DD HH:mm:ss').format('DD-MMM-YYYY'),
                age: moment().diff(dob, 'years'),
                filepath,
                results,
                logo: `${process.env.ENDPOINT}/public/images/logo.png`,
            };

            let content;
            switch (type) {
                case 'regimen':
                    content = { ...data };

                    await generatePDF('regimen-prescription', content);
                    break;
                case 'lab':
                default:
                    content = {
                        ...data,
                        lab_id: request.code,
                        specimen: specimen.join(', '),
                    };

                    await generatePDF('lab-result', content);
                    break;
            }

            return { success: true, file: `${process.env.ENDPOINT}/public/result/${filename}` };
        } catch (error) {
            console.log(error);
            return { success: false, message: error.message };
        }
    }
}
