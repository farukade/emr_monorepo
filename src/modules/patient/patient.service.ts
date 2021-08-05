import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PatientRepository } from './repositories/patient.repository';
import { PatientNOKRepository } from './repositories/patient.nok.repository';
import { Patient } from './entities/patient.entity';
import { PatientDto } from './dto/patient.dto';
import { Brackets, Connection, getConnection } from 'typeorm';
import { PatientVitalRepository } from './repositories/patient_vitals.repository';
import { PatientVital } from './entities/patient_vitals.entity';
import * as moment from 'moment';
import { VoucherRepository } from '../finance/vouchers/voucher.repository';
import { Voucher } from '../finance/vouchers/voucher.entity';
import { PatientDocument } from './entities/patient_documents.entity';
import { PatientDocumentRepository } from './repositories/patient_document.repository';
import { StaffDetails } from '../hr/staff/entities/staff_details.entity';
import { OpdPatientDto } from './dto/opd-patient.dto';
import { AppGateway } from '../../app.gateway';
import { AppointmentRepository } from '../frontdesk/appointment/appointment.repository';
import { AuthRepository } from '../auth/auth.repository';
import { TransactionsRepository } from '../finance/transactions/transactions.repository';
import { formatPID, getStaff } from '../../common/utils/utils';
import { AdmissionClinicalTaskRepository } from './admissions/repositories/admission-clinical-tasks.repository';
import { AdmissionsRepository } from './admissions/repositories/admissions.repository';
import { Immunization } from './immunization/entities/immunization.entity';
import { Pagination } from '../../common/paginate/paginate.interface';
import { PaginationOptionsInterface } from '../../common/paginate';
import { ImmunizationRepository } from './immunization/repositories/immunization.repository';
import { PatientRequestItemRepository } from './repositories/patient_request_items.repository';
import { MailService } from '../mail/mail.service';
import { Transactions } from '../finance/transactions/transaction.entity';
import { PatientAlert } from './entities/patient_alert.entity';
import { PatientAlertRepository } from './repositories/patient_alert.repository';
import { HmoSchemeRepository } from '../hmo/repositories/hmo_scheme.repository';
import { ServiceCategoryRepository } from '../settings/services/repositories/service_category.repository';
import { ServiceRepository } from '../settings/services/repositories/service.repository';
import { ServiceCostRepository } from '../settings/services/repositories/service_cost.repository';
import { PatientNoteRepository } from './repositories/patient_note.repository';
import { PatientNote } from './entities/patient_note.entity';

@Injectable()
export class PatientService {
    constructor(
        private mailService: MailService,
        @InjectRepository(PatientRepository)
        private patientRepository: PatientRepository,
        @InjectRepository(PatientNOKRepository)
        private patientNOKRepository: PatientNOKRepository,
        @InjectRepository(PatientVitalRepository)
        private patientVitalRepository: PatientVitalRepository,
        @InjectRepository(HmoSchemeRepository)
        private hmoSchemeRepository: HmoSchemeRepository,
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
        @InjectRepository(PatientAlertRepository)
        private patientAlertRepository: PatientAlertRepository,
        @InjectRepository(ServiceCategoryRepository)
        private serviceCategoryRepository: ServiceCategoryRepository,
        @InjectRepository(ServiceRepository)
        private serviceRepository: ServiceRepository,
        @InjectRepository(ServiceCostRepository)
        private serviceCostRepository: ServiceCostRepository,
        @InjectRepository(PatientNoteRepository)
        private patientNoteRepository: PatientNoteRepository,
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
                    .orWhere('LOWER(p.email) Like :email', { email: `%${q.toLowerCase()}%` })
                    .orWhere('p.phone_number Like :phone', { phone: `%${q}%` })
                    .orWhere('p.legacy_patient_id Like :id', { legacy_patient_id: `%${q}%` })
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
            patient.immunization = await this.immunizationRepository.find({ where: { patient } });

            if (patient.hmo_scheme_id) {
                patient.hmo = await this.hmoSchemeRepository.findOne(patient.hmo_scheme_id);
            }

            if (patient.nextOfKin_id) {
                patient.nextOfKin = await this.nextOfKinRepository.findOne(patient.nextOfKin_id);
            }

            const transactions = await this.transactionsRepository.createQueryBuilder('q')
                .select('q.*')
                .where('q.status = :status', { status: 0 })
                .andWhere('q.patient_id = :patient_id', { patient_id: patient.id })
                .andWhere('q.payment_type = :type', { type: 'self' })
                .getRawMany();

            patient.outstanding = Math.abs(patient.creditLimit > 0 ? 0 : transactions.reduce((totalAmount, item) => totalAmount + item.balance, 0));
        }

        return {
            result: patients,
            lastPage: Math.ceil(total / options.limit),
            itemsPerPage: options.limit,
            totalPages: total,
            currentPage: options.page,
        };
    }

    async findPatient(param): Promise<Patient[]> {
        const { q, isOpd } = param;

        const query = this.patientRepository.createQueryBuilder('p')
            .select('p.*')
            .andWhere(new Brackets(qb => {
                qb.where('LOWER(p.surname) Like :surname', { surname: `%${q.toLowerCase()}%` })
                    .orWhere('LOWER(p.other_names) Like :other_names', { other_names: `%${q.toLowerCase()}%` })
                    .orWhere('LOWER(p.email) Like :email', { email: `%${q.toLowerCase()}%` })
                    .orWhere('p.legacy_patient_id Like :legacy_id', { legacy_id: `%${q}%` })
                    .orWhere('p.phone_number Like :phone', { phone: `%${q}%` })
                    .orWhere('CAST(p.id AS text) LIKE :id', { id: `%${q}%` });
            }));

        if (isOpd && isOpd !== '') {
            const isOutPatient = (isOpd === 1);
            query.andWhere('p.is_out_patient Like :isOutPatient', { isOutPatient });
        }

        const patients = await query.take(20).getRawMany();

        for (const patient of patients) {
            patient.immunization = await this.immunizationRepository.find({
                where: { patient },
            });

            if (patient.hmo_scheme_id) {
                patient.hmo = await this.hmoSchemeRepository.findOne(patient.hmo_scheme_id);
            }

            if (patient.nextOfKin_id) {
                patient.nextOfKin = await this.nextOfKinRepository.findOne(patient.nextOfKin_id);
            }

            const transactions = await this.transactionsRepository.createQueryBuilder('q')
                .select('q.*')
                .where('q.status = :status', { status: 0 })
                .andWhere('q.patient_id = :patient_id', { patient_id: patient.id })
                .andWhere('q.payment_type = :type', { type: 'self' })
                .getRawMany();

            patient.outstanding = Math.abs(patient.creditLimit > 0 ? 0 : transactions.reduce((total, item) => total + item.balance, 0));
        }

        return patients;
    }

    async saveNewPatient(patientDto: PatientDto, createdBy: string, pic): Promise<any> {
        try {
            const { hmoId, email, phoneNumber } = patientDto;

            const emailFound = await this.patientRepository.findOne({ where: { email } });
            if (emailFound) {
                return { success: false, message: 'email already exists, please use another email address' };
            }

            const phoneFound = await this.patientRepository.findOne({ where: { phoneNumber } });
            if (phoneFound) {
                return { success: false, message: 'phone number already exists, please use another phone number.' };
            }

            let hmo = await this.hmoSchemeRepository.findOne(hmoId);

            let nok = await this.patientNOKRepository.findOne({
                where: [{ phoneNumber: patientDto.nok_phoneNumber }, { email: patientDto.nok_email }],
            });

            if (!nok) {
                nok = await this.patientNOKRepository.saveNOK(patientDto);
            }

            const patient = await this.patientRepository.savePatient(patientDto, nok, hmo, createdBy, pic);

            const splits = patient.other_names.split(' ');
            const message = `Dear ${patient.surname} ${splits.length > 0 ? splits[0] : patient.other_names}, welcome to the DEDA Family. Your ID/Folder number is ${formatPID(patient.id)}. Kindly save the number and provide it at all your appointment visits. Thank you.`;

            let serviceCost;
            const category = await this.serviceCategoryRepository.findOne({ where: { name: 'registration' } });
            const service = await this.serviceRepository.findOne({ where: { category } });
            if (service) {
                serviceCost = await this.serviceCostRepository.findOne({ where: { code: service.code, hmo } });
            }
            if (!serviceCost || (serviceCost && serviceCost.tariff === 0)) {
                hmo = await this.hmoSchemeRepository.findOne({
                    where: { name: 'Private' },
                });

                serviceCost = await this.serviceCostRepository.findOne({
                    where: { code: service.code, hmo },
                });
            }

            const data = {
                patient,
                amount: serviceCost.tariff,
                description: 'Payment for Patient Registration',
                payment_type: (hmo.name !== 'Private') ? 'HMO' : 'self',
                bill_source: category.name,
                service: serviceCost,
                createdBy,
                status: 0,
                hmo,
                transaction_type: 'debit',
                balance: serviceCost.tariff * -1,
            };

            await this.save(data);

            try {
                const mail = {
                    id: patient.id,
                    name: `${patient.other_names} ${patient.surname}`,
                    email: patient.email,
                    phoneNumber: patient.phoneNumber,
                    createdAt: patient.createdAt,
                    message,
                };
                await this.mailService.sendMail(mail, 'registration');
            } catch (e) {
                console.log(e);
            }

            const transactions = await this.transactionsRepository.find({ where: { patient, status: 0 } });

            const outstanding = Math.abs(patient.creditLimit > 0 ? 0 : transactions.reduce((total, item) => total + item.balance, 0));
            const pat = { ...patient, outstanding };

            return { success: true, patient: pat };
        } catch (err) {
            console.log(err);
            return { success: false, message: err.message };
        }
    }

    async saveNewOpdPatient(patientDto: OpdPatientDto, createdBy: string, pic): Promise<any> {
        try {
            console.log(patientDto);

            const patient = new Patient();
            patient.surname = patientDto.surname.toLocaleLowerCase();
            patient.other_names = patientDto.other_names.toLocaleLowerCase();
            patient.address = patientDto.address.toLocaleLowerCase();
            patient.date_of_birth = moment(patientDto.date_of_birth).format('YYYY-MM-DD');
            patient.gender = patientDto.gender;
            patient.email = patientDto.email;
            patient.phoneNumber = patientDto.phoneNumber;
            patient.createdBy = createdBy;
            if (pic) {
                patient.profile_pic = pic.filename;
            }
            console.log(patient);

            return { success: false, message: 'could not save patient' };

            await patient.save();
            // save appointment
            const appointment = await this.appointmentRepository.saveOPDAppointment(patient, patientDto.opdType);
            // send new opd socket message
            this.appGateway.server.emit('new-opd-queue', appointment);

            // return { success: true, patient };
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
            patient.hmo = await this.hmoSchemeRepository.findOne(patientDto.hmoId);
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
        try {
            const { patient_id, readingType, reading, task_id } = param;
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
                const values = Object.values(reading);
                const single = values[0];
                const message = `${readingType} Value ${single} is not within the NORMAL range`;
                console.log(message);

                let isAbnormal = false;

                switch (readingType) {
                    case 'Temperature':
                        if (single < 36.1 || single > 37.2) {
                            isAbnormal = true;
                        }
                        break;
                    case 'BMI':
                        if (single < 18.5 || single > 24.9) {
                            isAbnormal = true;
                        }
                        break;
                }

                const data = {
                    readingType,
                    reading,
                    patient,
                    createdBy,
                    task: task || null,
                    isAbnormal,
                };
                const readings = await this.patientVitalRepository.save(data);

                if (isAbnormal) {
                    const alert = new PatientAlert();
                    alert.patient = patient;
                    alert.type = readingType;
                    alert.message = message;
                    await alert.save();
                }

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

    async getTransactions(options: PaginationOptionsInterface, id, params): Promise<any> {
        const { startDate, endDate, q, status } = params;

        const query = this.transactionsRepository.createQueryBuilder('t').select('t.*')
            .where('t.patient_id = :id', { id });

        const page = options.page - 1;

        if (q && q !== '') {
            query.andWhere(new Brackets(qb => {
                qb
                    .orWhere('LOWER(t.description) Like :description', { description: `%${q.toLowerCase()}%` })
                    .orWhere('t.transaction_details Like :details', { details: `%${q}%` });
            }));
        }

        if (startDate && startDate !== '') {
            const start = moment(startDate).endOf('day').toISOString();
            query.andWhere(`t.createdAt >= '${start}'`);
        }
        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.andWhere(`t.createdAt <= '${end}'`);
        }

        if (status && status !== '') {
            query.andWhere('t.status = :status', { status });
        }

        const transactions = await query.offset(page * options.limit)
            .limit(options.limit)
            .orderBy('t.createdAt', 'DESC')
            .getRawMany();

        const total = await query.getCount();

        let result = [];
        for (const transaction of transactions) {
            transaction.hmo = await this.hmoSchemeRepository.findOne(transaction.hmo_scheme_id);

            transaction.staff = await getStaff(transaction.lastChangedBy);

            if (transaction.service_cost_id) {
                transaction.service = await this.serviceCostRepository.findOne(transaction.service_cost_id);
            }

            if (transaction.patient_request_item_id) {
                transaction.patientRequestItem = await this.patientRequestItemRepository.findOne(transaction.patient_request_item_id, { relations: ['request'] });
            }

            result = [...result, transaction];
        }

        const outstanding = transactions.filter(t => t.status !== 1 && t.payment_type === 'self')
            .reduce((sumTotal, item) => sumTotal + item.balance, 0);

        const totalAmount = transactions.reduce((sumTotal, item) => sumTotal + item.amount, 0);

        return {
            result,
            lastPage: Math.ceil(total / options.limit),
            itemsPerPage: options.limit,
            totalPages: total,
            currentPage: options.page,
            total_amount: totalAmount,
            outstanding_amount: Math.abs(outstanding),
        };
    }

    async getDocuments(id, urlParams): Promise<PatientDocument[]> {
        const { startDate, endDate, documentType } = urlParams;

        const query = this.patientDocumentRepository.createQueryBuilder('q').select('q.*')
            .where('q.patient_id = :id', { id });

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

    async getDiagnoses(id, urlParams): Promise<PatientNote[]> {
        const { startDate, endDate, status } = urlParams;

        const query = this.patientNoteRepository.createQueryBuilder('q')
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

        if (status && status !== '') {
            query.andWhere('q.status = :status', { status });
        }

        return await query.orderBy('q.createdAt', 'DESC').getMany();
    }

    async getAlerts(id: number): Promise<PatientAlert[]> {
        const query = this.patientAlertRepository.createQueryBuilder('q')
            .innerJoin(Patient, 'patient', 'q.patient = patient.id')
            .where('q.patient = :id', { id })
            .andWhere('q.read = :read', { read: false });

        return await query.orderBy('q.createdAt', 'DESC').getMany();
    }

    async readAlert(id: number, readBy): Promise<PatientAlert> {
        const alertItem = await this.patientAlertRepository.findOne(id);
        alertItem.read = true;
        alertItem.readBy = readBy;
        alertItem.lastChangedBy = readBy;

        return await alertItem.save();
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

            if (param.document_type === 'scans') {
                requestItem.filled = 1;
                requestItem.filledBy = createdBy;
                requestItem.filledAt = moment().format('YYYY-MM-DD HH:mm:ss');
                requestItem.lastChangedBy = createdBy;
                requestItem.document = rs;
                const res = await requestItem.save();

                return { success: true, data: res };
            }

            return { success: true, document: rs };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    public async save(data) {
        return await getConnection()
            .createQueryBuilder()
            .insert()
            .into(Transactions)
            .values(data)
            .execute();
    }

    async doSaveCreditLimit(id, param, updatedBy): Promise<any> {
        try {
            const patient = await this.patientRepository.findOne(id);
            patient.creditLimit = param.amount;
            patient.creditLimitExpiryDate = param.expiry_date;
            patient.lastChangedBy = updatedBy;
            const rs = await patient.save();

            return { success: true, patient: rs };
        } catch (error) {
            console.log(error);
            return { success: false, message: error.message };
        }
    }
}
