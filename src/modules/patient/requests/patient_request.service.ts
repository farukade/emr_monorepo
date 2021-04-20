import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../hr/entities/user.entity';
import { StaffDetails } from '../../hr/staff/entities/staff_details.entity';
import * as moment from 'moment';
import { PatientRequestHelper } from '../../../common/utils/PatientRequestHelper';
import { RequestPaymentHelper } from '../../../common/utils/RequestPaymentHelper';
import { PatientRequestRepository } from '../repositories/patient_request.repository';
import { HmoRepository } from '../../hmo/hmo.repository';
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

@Injectable()
export class PatientRequestService {
    constructor(
        private readonly appGateway: AppGateway,
        @InjectRepository(PatientRequestRepository)
        private patientRequestRepository: PatientRequestRepository,
        @InjectRepository(HmoRepository)
        private hmoRepository: HmoRepository,
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
            .select('q.id, q.requestType, q.code, q.createdAt, q.status, q.urgent, q.requestNote, q.isFilled')
            .addSelect('CONCAT(staff1.first_name || \' \' || staff1.last_name) as created_by, staff1.id as created_by_id')
            .addSelect('CONCAT(patient.other_names || \' \' || patient.surname) as patient_name, patient.id as patient_id')
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

        if (status === 'Filled') {
            query.andWhere('q.isFilled = :filled', { filled: true });
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
            item.hmo = await this.hmoRepository.findOne(item.hmo_id);

            item.items = await this.patientRequestItemRepository.find({ where: { request: item }, relations: ['diagnosis', 'transaction'] });

            const patient = await this.patientRepository.findOne(item.patient, {
                relations: ['nextOfKin', 'immunization', 'hmo'],
            });

            if (patient.profile_pic) {
                patient.profile_pic = `${process.env.ENDPOINT}/uploads/avatars/${patient.profile_pic}`;
            }

            item.patient = patient;

            item.transaction = await this.transactionsRepository.findOne({ where: { request: item } });

            result = [...result, item];
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
        const { startDate, endDate, filled, page, limit, today } = urlParams;

        const queryLimit = limit ? parseInt(limit, 10) : 30;
        const offset = (page ? parseInt(page, 10) : 1) - 1;

        const query = this.patientRequestRepository.createQueryBuilder('q')
            .leftJoin('q.patient', 'patient')
            .leftJoin(User, 'creator', 'q.createdBy = creator.username')
            .innerJoin(StaffDetails, 'staff1', 'staff1.user_id = creator.id')
            .select('q.id, q.requestType, q.code, q.createdAt, q.status, q.urgent, q.requestNote, q.isFilled')
            .addSelect('CONCAT(staff1.first_name || \' \' || staff1.last_name) as created_by, staff1.id as created_by_id')
            .addSelect('CONCAT(patient.surname || \' \' || patient.other_names) as patient_name, patient.id as patient_id, patient.hmo_id as hmo_id')
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

        if (filled) {
            query.andWhere(`q.isFilled = ${true}`);
        }

        const count = await query.getCount();

        const items = await query.orderBy({
            'q.urgent': 'DESC',
            'q.createdAt': 'DESC',
        }).limit(queryLimit).offset(offset * queryLimit).getRawMany();

        let result = [];
        for (const item of items) {
            item.hmo = await this.hmoRepository.findOne(item.hmo_id);

            item.items = await this.patientRequestItemRepository.find({ where: { request: item }, relations: ['diagnosis', 'transaction'] });

            const patient = await this.patientRepository.findOne(item.patient, {
                relations: ['nextOfKin', 'immunization', 'hmo'],
            });

            if (patient.profile_pic) {
                patient.profile_pic = `${process.env.ENDPOINT}/uploads/avatars/${patient.profile_pic}`;
            }

            item.patient = patient;

            item.transaction = await this.transactionsRepository.findOne({ where: { request: item } });

            result = [...result, item];
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
            case 'lab':
                // save request
                let labRequest = await PatientRequestHelper.handleLabRequest(param, patient, createdBy);
                if (labRequest.success) {
                    // save transaction
                    const payment = await RequestPaymentHelper.clinicalLabPayment(labRequest.data, patient, createdBy);
                    // @ts-ignore
                    labRequest = { ...payment.labRequest };

                    this.appGateway.server.emit('paypoint-queue', { payment: payment.transactions });
                }
                res = labRequest;
                break;
            case 'pharmacy':
                let pharmacyReq = await PatientRequestHelper.handlePharmacyRequest(param, patient, createdBy);
                if (pharmacyReq.success) {
                    pharmacyReq = { ...pharmacyReq };
                }
                res = pharmacyReq;
                break;
            case 'radiology':
                let request = await PatientRequestHelper.handleServiceRequest(param, patient, createdBy, requestType);
                if (request.success) {
                    // save transaction
                    const payment = await RequestPaymentHelper.servicePayment(request.data, patient, createdBy, requestType, 'now');

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

            case 'immunization':
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
            const request = await this.patientRequestItemRepository.findOne(id);
            request.received = 1;
            request.receivedBy = username;
            request.receivedAt = moment().format('YYYY-MM-DD HH:mm:ss');
            request.lastChangedBy = username;
            await request.save();

            const rs = await this.patientRequestItemRepository.findOne({ where: { id }, relations: ['diagnosis', 'transaction'] });

            return { success: true, data: rs };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }

    async doFillRequest(param, requestId, updatedBy) {
        const { patient_id, total_amount, items } = param;
        try {
            const request = await this.patientRequestRepository.findOne(requestId);

            const patient = await this.patientRepository.findOne(patient_id, {
                relations: ['nextOfKin', 'immunization', 'hmo'],
            });

            for (const item of items) {
                const requestItem = await this.patientRequestItemRepository.findOne(item.id);
                requestItem.filled = 1;
                requestItem.fillQuantity = item.fillQuantity;
                requestItem.filledAt = moment().format('YYYY-MM-DD HH:mm:ss');
                requestItem.filledBy = updatedBy;
                await requestItem.save();
            }

            // save transaction
            const data = {
                patient,
                amount: total_amount,
                description: 'Payment for pharmacy request',
                payment_type: patient.hmo.id === 1 ? 'Private' : 'HMO',
                hmo_approval_status: patient.hmo.id === 1 ? 2 : 0,
                transaction_type: 'pharmacy',
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
            };

            const payment = await getConnection()
                .createQueryBuilder()
                .insert()
                .into(Transactions)
                .values(data)
                .execute();

            const transaction = { ...payment.generatedMaps[0] };

            request.isFilled = true;
            request.transaction = await this.transactionsRepository.findOne(transaction.id);
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
        const { type, request_item_id } = params;

        const result = await this.patientRequestRepository.findOne({ where: { id }, relations: ['patient', 'items', 'transaction'] });

        switch (type) {
            case 'lab':
            case 'radiology':
                try {
                    const item = await this.patientRequestItemRepository.findOne({
                        where: { id: request_item_id },
                        relations: ['diagnosis', 'transaction'],
                    });
                    item.approved = 1;
                    item.approvedBy = username;
                    item.approvedAt = moment().format('YYYY-MM-DD HH:mm:ss');
                    item.lastChangedBy = username;
                    const res = await item.save();

                    result.status = 1;
                    await result.save();

                    return { success: true, data: res };
                } catch (e) {
                    return { success: false, message: e.message };
                }
            case 'pharmacy':
            default:
                try {
                    const patient = result.patient;
                    const admission = await this.admissionRepository.findOne({ where: { patient } });

                    let resultItems = [];
                    for (const item of result.items) {
                        const requestItem = await this.patientRequestItemRepository.findOne(item.id, { relations: ['diagnosis'] });

                        requestItem.approved = 1;
                        requestItem.approvedBy = username;
                        requestItem.approvedAt = moment().format('YYYY-MM-DD HH:mm:ss');
                        requestItem.lastChangedBy = username;
                        const rs = await requestItem.save();

                        resultItems = [...resultItems, rs];
                    }

                    let results = [];
                    for (const item of result.items) {
                        // @ts-ignore
                        const { vaccine } = item;
                        if (vaccine) {
                            const newTask = new AdmissionClinicalTask();

                            newTask.task = 'Immunization';
                            newTask.title = `Give ${item.drug.name} Immediately`;
                            newTask.taskType = 'regimen';
                            newTask.drug = item.drug;
                            newTask.dose = 1;
                            newTask.interval = 1;
                            newTask.intervalType = 'immediately';
                            newTask.frequency = 'Immediately';
                            newTask.taskCount = 1;
                            newTask.startTime = moment().format('YYYY-MM-DD HH:mm:ss');
                            newTask.nextTime = moment().format('YYYY-MM-DD HH:mm:ss');
                            newTask.patient = patient;
                            newTask.admission = admission;
                            newTask.createdBy = username;
                            newTask.request = result;

                            const rs = await newTask.save();
                            results = [...results, rs];
                        }
                    }

                    result.status = 1;
                    result.lastChangedBy = username;
                    const res = await result.save();

                    return { success: true, data: { ...res, items: resultItems } };
                } catch (e) {
                    return { success: false, message: e.message };
                }
        }
    }

    async fillResult(id: string, param, username: string) {
        try {
            const { parameters, note, result } = param;
            const request = await this.patientRequestItemRepository.findOne(id);
            request.filled = 1;
            request.filledBy = username;
            request.filledAt = moment().format('YYYY-MM-DD HH:mm:ss');
            request.parameters = parameters;
            request.note = note;
            request.result = result;
            request.lastChangedBy = username;
            await request.save();

            const rs = await this.patientRequestItemRepository.findOne({ where: { id }, relations: ['diagnosis', 'transaction'] });

            return { success: true, data: rs };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }

    async rejectResult(id: string, params, username: string) {
        try {
            const request = await this.patientRequestItemRepository.findOne(id);
            request.filled = 0;
            request.filledBy = null;
            request.filledAt = null;
            request.parameters = request.parameters.map(p => ({
                ...p,
                inference: '',
                value: '',
            }));
            request.result = null;
            request.lastChangedBy = username;

            if (params.type === 'radiology') {
                request.document = null;
            }

            await request.save();

            const rs = await this.patientRequestItemRepository.findOne({ where: { id }, relations: ['diagnosis', 'transaction'] });

            return { success: true, data: rs };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }

    async deleteRequest(id: string, params, username: string) {
        // const { type } = params;
        const requestItem = await this.patientRequestItemRepository.findOne(id);
        if (!requestItem) {
            throw new NotFoundException(`Request with ID '${id}' not found`);
        }

        requestItem.cancelled = 1;
        requestItem.cancelledBy = username;
        requestItem.cancelledAt = moment().format('YYYY-MM-DD HH:mm:ss');
        requestItem.lastChangedBy = username;
        requestItem.deletedBy = username;
        await requestItem.save();

        const request = await this.patientRequestRepository.findOne(params.request_id);
        request.deletedBy = username;
        await request.save();

        try {
            const transaction = await this.transactionsRepository.findOne({ where: { patientRequestItem: requestItem } });
            transaction.deletedBy = username;
            await transaction.save();
            await transaction.softRemove();
        } catch (e) {
            console.log(e);
        }

        try {
            const transaction = await this.transactionsRepository.findOne({ where: { request } });
            transaction.deletedBy = username;
            await transaction.save();
            await transaction.softRemove();
        } catch (e) {
            console.log(e);
        }

        await requestItem.softRemove();

        await request.softRemove();

        const rs = await this.patientRequestRepository.findOne(params.request_id, { withDeleted: true });
        rs.items = await this.patientRequestItemRepository.find({ where: { id }, withDeleted: true, relations: ['diagnosis', 'transaction'] });

        return { success: true, data: rs };
    }

    async printResult(id: number, params) {
        try {
            const { print_group, type } = params;

            const request = await this.patientRequestRepository.findOne(id, { relations: ['patient', 'items'] });

            const patient = request.patient;

            // tslint:disable-next-line:prefer-const
            let results;
            const printGroup = parseInt(print_group, 10);
            if (printGroup === 1) {
                results = await this.patientRequestRepository.find({ where: { code: request.code }, relations: ['patient', 'items'] });
            } else {
                results = [request];
            }

            const specimen = [...results.map(r => r.items.map(i => i.labTest.specimens.map(s => s.label)))];

            const date = new Date();
            const filename = `${type}-${date.getTime()}.pdf`;
            const filepath = path.resolve(__dirname, `../../../public/result/${filename}`);

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
            return { success: false, message: error.message };
        }
    }
}
