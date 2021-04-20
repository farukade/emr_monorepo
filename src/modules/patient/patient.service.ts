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
import { PatientVital } from './entities/patient_vitals.entity';
import { PatientRequestRepository } from './repositories/patient_request.repository';
import * as moment from 'moment';
import { HmoRepository } from '../hmo/hmo.repository';
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
import { formatPID, sendSMS } from '../../common/utils/utils';
import { AdmissionClinicalTaskRepository } from './admissions/repositories/admission-clinical-tasks.repository';
import { AdmissionsRepository } from './admissions/repositories/admissions.repository';
import { Immunization } from './immunization/entities/immunization.entity';
import { Pagination } from '../../common/paginate/paginate.interface';
import { PaginationOptionsInterface } from '../../common/paginate';
import { ImmunizationRepository } from './immunization/repositories/immunization.repository';
import { PatientRequestItemRepository } from './repositories/patient_request_items.repository';
import { PatientDiagnosisRepository } from './repositories/patient_diagnosis.repository';
import { PatientDiagnosis } from './entities/patient_diagnosis.entity';
import { PatientAllergenRepository } from './repositories/patient_allergen.repository';

@Injectable()
export class PatientService {
    constructor(
        @InjectRepository(PatientRepository)
        private patientRepository: PatientRepository,
        @InjectRepository(PatientNOKRepository)
        private patientNOKRepository: PatientNOKRepository,
        @InjectRepository(PatientVitalRepository)
        private patientVitalRepository: PatientVitalRepository,
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
            const message = `Dear ${patient.surname} ${splits.length > 0 ? splits[0] : patient.other_names}, welcome to the DEDA Family. Your ID/Folder number is ${formatPID(patient.id)}. Kindly save the number and provide it at all your appointment visits. Thank you.`;

            if (process.env.DEBUG === 'false') {
                await sendSMS(patient.phoneNumber, message);
            }

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

    async getDiagnoses(id, urlParams): Promise<PatientDiagnosis[]> {
        const { startDate, endDate, status } = urlParams;

        const query = this.patientDiagnosisRepository.createQueryBuilder('q')
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
