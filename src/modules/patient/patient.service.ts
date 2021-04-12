import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PatientRepository } from './repositories/patient.repository';
import { PatientNOKRepository } from './repositories/patient.nok.repository';
import { Patient } from './entities/patient.entity';
import { PatientDto } from './dto/patient.dto';
import { Connection, getConnection, Brackets } from 'typeorm';
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
import { generatePDF, sendSMS } from '../../common/utils/utils';
import * as path from 'path';
import { AdmissionClinicalTaskRepository } from './admissions/repositories/admission-clinical-tasks.repository';
import { AdmissionsRepository } from './admissions/repositories/admissions.repository';
import { Immunization } from './immunization/entities/immunization.entity';
import { Pagination } from '../../common/paginate/paginate.interface';
import { PaginationOptionsInterface } from '../../common/paginate';
import { ImmunizationRepository } from './immunization/repositories/immunization.repository';
import { PatientRequestItemRepository } from './repositories/patient_request_items.repository';
import { PatientDiagnosisRepository } from './repositories/patient_diagnosis.repository';
import { AdmissionClinicalTask } from './admissions/entities/admission-clinical-task.entity';

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
        @InjectRepository(PatientDiagnosisRepository)
        private patientDiagnosisRepository: PatientDiagnosisRepository,
    ) {
    }

    async listAllPatients(options: PaginationOptionsInterface, params): Promise<Pagination> {
        const { startDate, endDate, q, status } = params;
        const query = this.patientRepository.createQueryBuilder('p').select('p.*');

        const page = options.page - 1;

        if (q && q !== '') {
            query.andWhere(new Brackets(qb => {
                qb.where('LOWER(p.surname) Like :surname', { surname: `%${q.toLowerCase()}%` })
                    .orWhere('LOWER(p.other_names) Like :other_names', { other_names: `%${q.toLowerCase()}%` })
                    .orWhere('p.folderNumber Like :folderNumber', { folderNumber: `%${q}%` })
                    .orWhere('CAST(p.id AS text) = :id', { id: `%${q}%` });
            }));
        }

        if (startDate && startDate !== '') {
            const start = moment(startDate).endOf('day').toISOString();
            query.andWhere(`p.createdAt >= '${start}'`);
        }
        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.andWhere(`p.createdAt <= '${end}'`);
        }

        if (status && status !== '') {
            query.andWhere('p.isActive = :status', { status: status === '1' });
        }

        const patients = await query.offset(page * options.limit)
            .limit(options.limit)
            .orderBy('p.createdAt', 'DESC')
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

            const transactions = await this.transactionsRepository.find({ where: { patient, status: 0 } });

            // tslint:disable-next-line:no-shadowed-variable
            patient.wallet = transactions.reduce((total, item) => total + item.amount, 0);
        }

        return {
            result: patients,
            lastPage: Math.ceil(total / options.limit),
            itemsPerPage: options.limit,
            totalPages: total,
            currentPage: options.page,
        };
    }

    async findPatient(param: string): Promise<Patient[]> {
        const patients = await this.patientRepository.createQueryBuilder('p')
            .select('p.*')
            .andWhere(new Brackets(qb => {
                qb.where('LOWER(p.surname) Like :surname', { surname: `%${param.toLowerCase()}%` })
                    .orWhere('LOWER(p.other_names) Like :other_names', { other_names: `%${param.toLowerCase()}%` })
                    .orWhere('p.folderNumber Like :folderNumber', { folderNumber: `%${param}%` })
                    .orWhere('CAST(p.id AS text) LIKE :id', { id: `%${param}%` });
            }))
            .getRawMany();

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

        return patients;
    }

    async saveNewPatient(patientDto: PatientDto, createdBy: string, pic): Promise<any> {
        console.log(pic);
        console.log(patientDto);
        try {
            const { hmoId } = patientDto;

            const hmo = await this.hmoRepository.findOne(hmoId);
            const nok = await this.patientNOKRepository.saveNOK(patientDto);

            const patient = await this.patientRepository.savePatient(patientDto, nok, hmo, createdBy, pic);

            const splits = patient.other_names.split(' ');
            const message = `Dear ${patient.surname} ${splits.length > 0 ? splits[0] : patient.other_names}, welcome to the DEDA Family. Your ID/Folder number is ${patient.id}. Kindly save the number and provide it at all uyour appointment visits. Thank you.`;
            await sendSMS(patient.phoneNumber, message);

            return { success: true, patient };
        } catch (err) {
            return { success: false, message: err.message };
        }
    }

    async saveNewOpdPatient(patientDto: OpdPatientDto, createdBy: string, pic): Promise<any> {
        try {
            const patient = new Patient();
            patient.folderNumber = patientDto.folderNumber;
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
            const stat = status === 'active';
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

    async getVitals(id, urlParams): Promise<PatientVital[]> {
        const { startDate, endDate } = urlParams;

        const query = this.patientVitalRepository.createQueryBuilder('q')
            .innerJoin(Patient, 'patient', 'q.patient = patient.id')
            .where('q.patient = :id', { id });
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
            .innerJoin(Patient, 'patient', 'q.patient = patient.id')
            .where('q.patient = :id', { id });
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

    async doUploadDocument(id, param, fileName, createdBy) {
        try {
            const patient = await this.patientRepository.findOne(id);

            const requestItem = await this.patientRequestItemRepository.findOne(param.id);

            const doc = new PatientDocument();
            doc.patient = patient;
            doc.document_type = param.document_type;
            doc.document_name = fileName;
            doc.createdBy = createdBy;
            const rs = await doc.save();

            if (param.document_type === 'radiology') {
                requestItem.filled = 1;
                requestItem.filledBy = createdBy;
                requestItem.filledAt = moment().format('YYYY-MM-DD HH:mm:ss');
                requestItem.lastChangedBy = createdBy;
                requestItem.document = rs;
                await requestItem.save();

                const item = await this.patientRequestItemRepository.findOne({ where: { id: param.id }, relations: ['diagnosis', 'transaction'] });

                return { success: true, data: item };
            }

            return { success: true, document: rs };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
}
