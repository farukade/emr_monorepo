import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PatientRepository } from './repositories/patient.repository';
import { PatientNOKRepository } from './repositories/patient.nok.repository';
import { Patient } from './entities/patient.entity';
import { PatientDto } from './dto/patient.dto';
import { Like, Connection, getConnection } from 'typeorm';
import { ServiceRepository } from '../settings/services/service.repository';
import { PatientVitalRepository } from './repositories/patient_vitals.repository';
import { PatientAntenatalRepository } from './repositories/patient_antenatal.repository';
import { PatientAllergyRepository } from './repositories/patient_allergy.repository';
import { PatientAllergyDto } from './dto/patient.allergy.dto';
import { PatientVital } from './entities/patient_vitals.entity';
import { PatientAllergy } from './entities/patient_allergies.entity';
import { PatientRequestHelper } from '../../common/utils/PatientRequestHelper';
import { PatientRequestRepository } from './repositories/patient_request.repository';
import * as moment from 'moment';
import { HmoRepository } from '../hmo/hmo.repository';
import { VoucherRepository } from '../finance/vouchers/voucher.repository';
import { Voucher } from '../finance/vouchers/voucher.entity';
import { PatientDocument } from './entities/patient_documents.entity';
import { PatientRequestDocument } from './entities/patient_request_documents.entity';
import { PatientDocumentRepository } from './repositories/patient_document.repository';
import { User } from '../hr/entities/user.entity';
import { StaffDetails } from '../hr/staff/entities/staff_details.entity';
import { RequestPaymentHelper } from '../../common/utils/RequestPaymentHelper';
import { OpdPatientDto } from './dto/opd-patient.dto';
import { AppGateway } from '../../app.gateway';
import { AppointmentRepository } from '../frontdesk/appointment/appointment.repository';
import { Transactions } from '../finance/transactions/transaction.entity';
import { AuthRepository } from '../auth/auth.repository';
import { TransactionsRepository } from '../finance/transactions/transactions.repository';
import { generatePDF } from '../../common/utils/utils';
import * as path from 'path';
import { AdmissionClinicalTaskRepository } from './admissions/repositories/admission-clinical-tasks.repository';
import { AdmissionClinicalTask } from './admissions/entities/admission-clinical-task.entity';
import { AdmissionsRepository } from './admissions/repositories/admissions.repository';
import { Immunization } from './immunization/entities/immunization.entity';
import { Specimen } from '../settings/entities/specimen.entity';
import { Pagination } from '../../common/paginate/paginate.interface';
import { PaginationOptionsInterface } from '../../common/paginate';
import { ImmunizationRepository } from './immunization/repositories/immunization.repository';
import { PatientRequestItemRepository } from './repositories/patient_request_items.repository';

@Injectable()
export class PatientService {
    constructor(
        @InjectRepository(PatientRepository)
        private patientRepository: PatientRepository,
        @InjectRepository(PatientNOKRepository)
        private patientNOKRepository: PatientNOKRepository,
        @InjectRepository(PatientVitalRepository)
        private patientVitalRepository: PatientVitalRepository,
        @InjectRepository(PatientAntenatalRepository)
        private patientAntenatalRepository: PatientAntenatalRepository,
        @InjectRepository(PatientAllergyRepository)
        private patientAllergyRepository: PatientAllergyRepository,
        @InjectRepository(PatientRequestRepository)
        private patientRequestRepository: PatientRequestRepository,
        @InjectRepository(ServiceRepository)
        private serviceRepository: ServiceRepository,
        @InjectRepository(HmoRepository)
        private hmoRepository: HmoRepository,
        @InjectRepository(VoucherRepository)
        private voucherRepository: VoucherRepository,
        @InjectRepository(PatientDocumentRepository)
        private patientDocumentRepository: PatientDocumentRepository,
        @InjectRepository(AppointmentRepository)
        private appointmentRepository: AppointmentRepository,
        @InjectRepository(AuthRepository)
        private authRepository: AuthRepository,
        @InjectRepository(TransactionsRepository)
        private transactionsRepository: TransactionsRepository,
        private connection: Connection,
        private readonly appGateway: AppGateway,
        @InjectRepository(AdmissionsRepository)
        private admissionRepository: AdmissionsRepository,
        @InjectRepository(AdmissionClinicalTaskRepository)
        private clinicalTaskRepository: AdmissionClinicalTaskRepository,
        @InjectRepository(PatientNOKRepository)
        private nextOfKinRepository: PatientNOKRepository,
        @InjectRepository(ImmunizationRepository)
        private immunizationRepository: ImmunizationRepository,
        @InjectRepository(PatientRequestItemRepository)
        private patientRequestItemRepository: PatientRequestItemRepository,
    ) {
    }

    async listAllPatients(options: PaginationOptionsInterface, params): Promise<Pagination> {
        const { startDate, endDate, patient_id } = params;
        const query = this.patientRepository.createQueryBuilder('q').select('q.*');

        if (startDate && startDate !== '') {
            const start = moment(startDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt >= '${start}'`);
        }
        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt <= '${end}'`);
        }

        if (patient_id && patient_id !== '') {
            query.andWhere('q.id = :id', { id: patient_id });
        }

        const patients = await query.offset(options.page * options.limit)
            .limit(options.limit)
            .orderBy('q.createdAt', 'DESC')
            .getRawMany();

        const total = await query.getCount();

        for (const patient of patients) {

            if (patient.profile_pic) {
                patient.profile_pic = `${process.env.ENDPOINT}/uploads/avatars/${patient.profile_pic}`;
            }

            patient.immunization = await this.immunizationRepository.find({ where: { patient } });

            if (patient.hmo_id) {
                patient.hmo = await this.hmoRepository.findOne(patient.hmo_id);
            }

            if (patient.nextOfKin_id) {
                patient.nextOfKin = await this.nextOfKinRepository.findOne(patient.nextOfKin_id);
            }
        }

        return {
            result: patients,
            lastPage: Math.ceil(total / options.limit),
            itemsPerPage: options.limit,
            totalPages: total,
            currentPage: options.page + 1,
        };
    }

    async findPatient(param: string): Promise<Patient[]> {
        return await this.patientRepository.find({
            where: [
                { surname: Like(`%${param.toLocaleLowerCase()}%`) },
                { other_names: Like(`%${param.toLocaleLowerCase()}%`) },
                { fileNumber: Like(`%${param}%`) },
            ], relations: ['nextOfKin', 'immunization', 'hmo'],
        });
    }

    async saveNewPatient(patientDto: PatientDto, createdBy: string, pic): Promise<any> {
        console.log(pic);
        console.log(patientDto);
        try {
            const { hmoId } = patientDto;

            const hmo = await this.hmoRepository.findOne(hmoId);
            const nok = await this.patientNOKRepository.saveNOK(patientDto);

            const patient = await this.patientRepository.savePatient(patientDto, nok, hmo, createdBy, pic);

            return { success: true, patient };
        } catch (err) {
            return { success: false, message: err.message };
        }
    }

    async saveNewOpdPatient(patientDto: OpdPatientDto, createdBy: string, pic): Promise<any> {
        try {
            const patient = new Patient();
            patient.fileNumber = 'DH' + Math.floor(Math.random() * 90000);
            patient.surname = patientDto.surname.toLocaleLowerCase();
            patient.other_names = patientDto.other_names.toLocaleLowerCase();
            patient.address = patientDto.address.toLocaleLowerCase();
            patient.date_of_birth = patientDto.date_of_birth;
            patient.gender = patientDto.gender;
            patient.email = patientDto.email;
            patient.phoneNumber = patientDto.phoneNumber;
            patient.createdBy = createdBy;
            if (pic) {
                patient.profile_pic = pic.filename;
            }
            await patient.save();
            // save appointment
            const appointment = await this.appointmentRepository.saveOPDAppointment(patient, patientDto.opdType);
            // send new opd socket message
            this.appGateway.server.emit('new-opd-queue', appointment);

            return { success: true, patient };
        } catch (err) {
            return { success: false, message: err.message };
        }
    }

    async updatePatientRecord(id: string, patientDto: PatientDto, updatedBy: string, pic): Promise<any> {
        try {
            const patient = await this.patientRepository.findOne(id, { relations: ['nextOfKin'] });
            patient.surname = patientDto.surname.toLocaleLowerCase();
            patient.other_names = patientDto.other_names.toLocaleLowerCase();
            patient.address = patientDto.address.toLocaleLowerCase();
            patient.date_of_birth = patientDto.date_of_birth;
            patient.occupation = patientDto.occupation;
            patient.gender = patientDto.gender;
            patient.email = patientDto.email;
            patient.phoneNumber = patientDto.phoneNumber;
            patient.maritalStatus = patientDto.maritalStatus;
            patient.ethnicity = patientDto.ethnicity;
            patient.referredBy = patientDto.referredBy;
            patient.lastChangedBy = updatedBy;
            patient.nextOfKin.surname = patientDto.nok_surname;
            patient.nextOfKin.other_names = patientDto.nok_other_names;
            patient.nextOfKin.address = patientDto.nok_address;
            patient.nextOfKin.date_of_birth = patientDto.nok_date_of_birth;
            patient.nextOfKin.relationship = patientDto.relationship;
            patient.nextOfKin.occupation = patientDto.nok_occupation;
            patient.nextOfKin.gender = patientDto.nok_gender;
            patient.nextOfKin.email = patientDto.nok_email;
            patient.nextOfKin.phoneNumber = patientDto.nok_phoneNumber;
            patient.nextOfKin.maritalStatus = patientDto.nok_maritalStatus;
            patient.nextOfKin.ethnicity = patientDto.nok_ethnicity;
            patient.hmo = await this.hmoRepository.findOne(patientDto.hmoId);
            if (pic) {
                patient.profile_pic = pic.filename;
            }
            const rs = patient.save();

            return { success: true, patient: rs };
        } catch (err) {
            return { success: false, message: err.message };
        }
    }

    async deletePatient(id: number, username) {
        const patient = await this.patientRepository.findOne(id);

        if (!patient) {
            throw new NotFoundException(`Patient with ID '${id}' not found`);
        }

        patient.deletedBy = username;
        await patient.save();

        return await patient.softRemove();
    }

    async checkPaymentStatus(param) {
        const { service_id, patient_id } = param;
        // find patient record
        const patient = this.patientRepository.findOne(patient_id);
    }

    async doSaveVitals(param, createdBy: string): Promise<any> {
        const { patient_id, readingType, reading, task_id } = param;
        try {
            const user = await this.authRepository.findOne({ where: { username: createdBy } });

            const staff = await this.connection.getRepository(StaffDetails)
                .createQueryBuilder('s')
                .where('s.user_id = :id', { id: user.id })
                .getOne();

            const patient = await this.patientRepository.findOne(patient_id);

            let task;
            if (task_id !== '') {
                task = await this.clinicalTaskRepository.findOne(task_id);

                if (task && task.tasksCompleted < task.taskCount) {
                    let nextTime;
                    switch (task.intervalType) {
                        case 'minutes':
                            nextTime = moment().add(task.interval, 'm').format('YYYY-MM-DD HH:mm:ss');
                            break;
                        case 'hours':
                            nextTime = moment().add(task.interval, 'h').format('YYYY-MM-DD HH:mm:ss');
                            break;
                        case 'days':
                            nextTime = moment().add(task.interval, 'd').format('YYYY-MM-DD HH:mm:ss');
                            break;
                        case 'weeks':
                            nextTime = moment().add(task.interval, 'w').format('YYYY-MM-DD HH:mm:ss');
                            break;
                        case 'months':
                            nextTime = moment().add(task.interval, 'M').format('YYYY-MM-DD HH:mm:ss');
                            break;
                        default:
                            break;
                    }

                    const completed = task.tasksCompleted + 1;

                    task.nextTime = nextTime;
                    task.tasksCompleted = completed;
                    task.lastChangedBy = createdBy;
                    task.completed = completed === task.taskCount;
                    await task.save();

                    if (task.drug && task.drug.vaccine) {
                        await getConnection()
                            .createQueryBuilder()
                            .update(Immunization)
                            .set({ date_administered: moment().format('YYYY-MM-DD HH:mm:ss'), administeredBy: staff })
                            .where('id = :id', { id: task.drug.vaccine.id })
                            .execute();
                    }
                }
            }

            if (patient) {
                const data = {
                    readingType,
                    reading,
                    patient,
                    createdBy,
                    task: task || null,
                };
                const readings = await this.patientVitalRepository.save(data);
                return { success: true, readings };
            } else {
                return { success: false, message: 'Patient record was not found' };
            }
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async doUpdateVital(vitalId, param, updatedBy): Promise<any> {
        try {
            const vital = await this.patientVitalRepository.findOne(vitalId);
            vital.reading = param.reading;
            vital.readingType = param.readingType;
            vital.lastChangedBy = updatedBy;
            await vital.save();

            return { success: true, vital };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async getVouchers(id, urlParams): Promise<Voucher[]> {
        const { startDate, endDate, status } = urlParams;

        const query = this.voucherRepository.createQueryBuilder('v')
            .where('v.patient_id = :id', { id });
        if (startDate && startDate !== '') {
            const start = moment(startDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt >= '${start}'`);
        }
        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt <= '${end}'`);
        }
        if (status && status !== '') {
            let stat;
            if (status === 'active') {
                stat = true;
            } else {
                stat = false;
            }
            query.andWhere('q.isActive = :status', { status: stat });
        }
        return await query.orderBy('q.createdAt', 'DESC').getMany();
    }

    async getDocuments(id, urlParams): Promise<PatientDocument[]> {
        const { startDate, endDate, documentType } = urlParams;

        const query = this.patientDocumentRepository.createQueryBuilder('v')
            .select(['v.document_name', 'v.document_type'])
            .where('v.patient_id = :id', { id });
        if (startDate && startDate !== '') {
            const start = moment(startDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt >= '${start}'`);
        }
        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt <= '${end}'`);
        }
        if (documentType && documentType !== '') {
            query.andWhere('q.document_type = :document_type', { document_type: documentType });
        }
        return await query.orderBy('q.createdAt', 'DESC').getMany();
    }

    async getRequestDocuments(id, urlParams): Promise<PatientRequestDocument[]> {
        const { startDate, endDate, documentType } = urlParams;

        return await this.connection.getRepository(PatientRequestDocument).createQueryBuilder('d')
            .select(['document_name'])
            .where('d.id = :id', { id })
            .getMany();

    }

    async getVitals(id, urlParams): Promise<PatientVital[]> {
        const { startDate, endDate } = urlParams;

        const query = this.patientVitalRepository.createQueryBuilder('q')
            .innerJoin(Patient, 'patient', 'q.patient_id = patient.id')
            .where('q.patient_id = :id', { id });
        if (startDate && startDate !== '') {
            const start = moment(startDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt >= '${start}'`);
        }
        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt <= '${end}'`);
        }
        return await query.orderBy('q.createdAt', 'DESC').getMany();
    }

    async deleteVital(id: string) {
        const result = await this.patientVitalRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Patient vital with ID '${id}' not found`);
        }
        return { success: true };
    }

    async doSaveAllergies(param: PatientAllergyDto, createdBy): Promise<any> {
        const { patient_id } = param;
        try {
            param.patient = await this.patientRepository.findOne(patient_id);
            const allergy = await this.patientAllergyRepository.save(param);
            allergy.createdBy = createdBy;
            allergy.save();
            return { success: true, allergy };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async doUpdateAllergy(allergyId, param: PatientAllergyDto, updatedBy): Promise<any> {
        try {
            const allergy = await this.patientAllergyRepository.findOne(allergyId);
            allergy.category = param.category;
            allergy.allergy = param.allergy;
            allergy.severity = param.severity;
            allergy.reaction = param.reaction;
            allergy.lastChangedBy = updatedBy;
            await allergy.save();

            return { success: true, allergy };

        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async getAllergies(id, urlParams): Promise<PatientAllergy[]> {
        const { startDate, endDate } = urlParams;

        const query = this.patientAllergyRepository.createQueryBuilder('q')
            .innerJoin(Patient, 'patient', 'q.patient_id = patient.id')
            .where('q.patient_id = :id', { id });
        if (startDate && startDate !== '') {
            const start = moment(startDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt >= '${start}'`);
        }
        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt <= '${end}'`);
        }
        return await query.orderBy('q.createdAt', 'DESC').getMany();
    }

    async deleteAllergy(id: string) {
        const result = await this.patientAllergyRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Patient allergy with ID '${id}' not found`);
        }
        return { success: true };
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
            case 'imaging':
                let imaging = await PatientRequestHelper.handleImagingRequest(param, patient, createdBy);
                console.log(imaging)
                if (imaging.success) {
                    // save transaction
                    const payment = await RequestPaymentHelper.imagingPayment(param.requestBody, patient, createdBy);
                    imaging = { ...imaging, ...payment };
                }
                res = imaging;
                break;
            case 'procedure':
                let procedure = await PatientRequestHelper.handleProcedureRequest(param, patient, createdBy);
                if (procedure.success && param.bill_now === true) {
                    // save transaction
                    const payment = await RequestPaymentHelper.procedurePayment(procedure.data, patient, createdBy);
                    procedure = { ...procedure, ...payment };
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

    async doFillRequest(param, requestId, updatedBy) {
        const { patient_id, total_amount } = param;
        try {
            const request = await this.patientRequestRepository.findOne(requestId);
            request.isFilled = true;
            const res = await request.save();

            const patient = await this.patientRepository.findOne(patient_id, { relations: ['hmo'] });

            // save transaction
            const data = {
                patient,
                amount: total_amount,
                description: 'Payment for pharmacy request',
                payment_type: patient.hmo.id === 1 ? 'Private' : 'HMO',
                hmo_approval_status: patient.hmo.id === 1 ? 2 : 0,
                transaction_type: 'pharmacy',
                // transaction_details: requestBody,
                createdBy: updatedBy,
                patientRequest: res,
            };

            const payment = await getConnection()
                .createQueryBuilder()
                .insert()
                .into(Transactions)
                .values(data)
                .execute();

            this.appGateway.server.emit('paypoint-queue', { payment });

            return { success: true, data: { ...res, transaction_status: 0, payment } };
        } catch (e) {
            // console.log(e.message)
            return { success: false, message: e.message };
        }
    }

    async listPatientRequests(requestType, patient_id, urlParams): Promise<any> {
        const { startDate, endDate, filled, page, limit } = urlParams;

        const queryLimit = limit ? parseInt(limit, 10) : 30;
        const offset = (page ? parseInt(page, 10) : 1) - 1;

        const query = this.patientRequestRepository.createQueryBuilder('q')
            .leftJoin('q.patient', 'patient')
            .leftJoin(User, 'creator', 'q.createdBy = creator.username')
            .innerJoin(StaffDetails, 'staff1', 'staff1.user_id = creator.id')
            .select('q.id, q.requestType, q.requestBody, q.code, q.createdAt, q.status, q.urgent, q.requestNote, q.isFilled')
            .addSelect('CONCAT(staff1.first_name || \' \' || staff1.last_name) as created_by, staff1.id as created_by_id')
            .addSelect('CONCAT(patient.surname || \' \' || patient.other_names) as patient_name, patient.id as patient_id, patient.hmo_id as hmo_id')
            .where('q.patient_id = :patient_id', { patient_id })
            .andWhere('q.requestType = :requestType', { requestType });

        if (startDate && startDate !== '') {
            if (endDate && endDate !== '') {
                const start = moment(startDate).startOf('day').format('YYYY-MM-DD HH:mm:ss');
                query.andWhere(`q.createdAt >= '${start}'`);
            } else {
                query.andWhere(`DATE(q.createdAt) = '${moment(startDate).format('YYYY-MM-DD')}'`);
            }
        }
        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').format('YYYY-MM-DD HH:mm:ss');
            query.andWhere(`q.createdAt <= '${end}'`);
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

            const requestItem = await this.patientRequestItemRepository.findOne({ where: { request: item } });
            item.transaction = await this.transactionsRepository.findOne({ where: { patientRequestItem: requestItem } });
            item.request_item = requestItem;

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


    async listRequests(requestType, urlParams): Promise<any> {
        const { startDate, endDate, filled, page, limit } = urlParams;

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
            const start = moment(startDate).startOf('day').toISOString();
            query.andWhere(`q.createdAt >= '${start}'`);
        }
        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt <= '${end}'`);
        }

        if (filled) {
            query.andWhere('q.isFilled = :filled', { filled: true });
        }

        const count = await query.getCount();

        const items = await query.orderBy({
            'q.urgent': 'DESC',
            'q.createdAt': 'DESC',
        }).limit(queryLimit).offset(offset * queryLimit).getRawMany();

        let result = [];
        for (const item of items) {
            item.hmo = await this.hmoRepository.findOne(item.hmo_id);

            const requestItem = await this.patientRequestItemRepository.findOne({ where: { request: item } });
            item.transaction = await this.transactionsRepository.findOne({ where: { patientRequestItem: requestItem } });
            item.request_item = requestItem;

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

    async doApproveResult(id: number, params, username) {
        const { type, request_id } = params;

        const result = await this.patientRequestRepository.findOne({ where: { id: request_id }, relations: ['patient'] });

        switch (type) {
            case 'lab':
                try {
                    const request = await this.patientRequestItemRepository.findOne(id);
                    request.approved = 1;
                    request.approvedBy = username;
                    request.approvedAt = moment().format('YYYY-MM-DD HH:mm:ss');
                    request.lastChangedBy = username;
                    const res = await request.save();

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
                    const admission = await this.admissionRepository.findOne({ where: { patientId: patient.id } });

                    const results = [];
                    for (const drug of result.items) {
                        //     // @ts-ignore
                        //     const { vaccine } = drug;
                        //     if (vaccine) {
                        //         const newTask = new AdmissionClinicalTask();
                        //
                        //         newTask.task = 'Immunization';
                        //         newTask.title = `Give ${drug.drug_name} Immediately`;
                        //         newTask.taskType = 'regimen';
                        //         newTask.drug = drug;
                        //         newTask.dose = 1;
                        //         newTask.interval = 1;
                        //         newTask.intervalType = 'immediately';
                        //         newTask.frequency = 'Immediately';
                        //         newTask.taskCount = 1;
                        //         newTask.startTime = moment().format('YYYY-MM-DD HH:mm:ss');
                        //         newTask.nextTime = moment().format('YYYY-MM-DD HH:mm:ss');
                        //         newTask.patient = patient;
                        //         newTask.admission = admission;
                        //         newTask.createdBy = username;
                        //         newTask.request = result;
                        //
                        //         const rs = await newTask.save();
                        //         results = [...results, rs];
                        //     }
                    }

                    result.status = 1;
                    result.lastChangedBy = username;
                    const res = await result.save();

                    return { success: true, data: res };
                } catch (e) {
                    return { success: false, message: e.message };
                }
        }
    }

    async receiveSpecimen(id: number, username: string) {
        try {
            const request = await this.patientRequestItemRepository.findOne(id);
            request.received = 1;
            request.receivedBy = username;
            request.receivedAt = moment().format('YYYY-MM-DD HH:mm:ss');
            request.lastChangedBy = username;
            const res = await request.save();

            return { success: true, data: res };
        } catch (e) {
            return { success: false, message: e.message };
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
            const res = await request.save();

            return { success: true, data: res };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }

    async rejectResult(id: string, username: string) {
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
            const res = await request.save();

            return { success: true, data: res };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }

    async deleteRequest(id: string, params, username: string) {
        const { type } = params;
        let res;
        const request = await this.patientRequestItemRepository.findOne(id);
        if (!request) {
            throw new NotFoundException(`Request with ID '${id}' not found`);
        }
        switch (type) {
            case 'lab':
                request.cancelled = 1;
                request.cancelledBy = username;
                request.cancelledAt = moment().format('YYYY-MM-DD HH:mm:ss');
                request.lastChangedBy = username;
                res = await request.save();
                break;
            case 'imaging':
                request.deletedBy = username;
                await request.save();
                return await request.softRemove();
            default:
                break;
        }

        return { success: true, data: res };
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

    async doUploadDocument(id, param, fileName, createdBy) {

        const patient = await this.patientRepository.findOne(id);
        try {
            const doc = new PatientDocument();
            doc.patient = patient;
            doc.document_type = param.document_type;
            doc.document_name = fileName;
            doc.createdBy = createdBy;
            await doc.save();

            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async doUploadRequestDocument(id, param, fileName, createdBy) {
        try {
            const request = await this.patientRequestRepository.findOne(id);
            const doc = new PatientRequestDocument();
            doc.request = request;
            doc.document_type = param.document_type;
            doc.document_name = fileName;
            doc.createdBy = createdBy;
            const rs = await doc.save();

            return { success: true, document: rs };
        } catch (error) {
            console.log(error);
            return { success: false, message: error.message };
        }
    }
}
