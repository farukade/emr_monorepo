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
import {
	formatPID,
	getBalance,
	getOutstanding,
	getStaff,
	postDebit,
	getLastAppointment,
	getDepositBalance, createServiceCost,
} from '../../common/utils/utils';
import { AdmissionClinicalTaskRepository } from './admissions/repositories/admission-clinical-tasks.repository';
import { AdmissionsRepository } from './admissions/repositories/admissions.repository';
import { Immunization } from './immunization/entities/immunization.entity';
import { Pagination } from '../../common/paginate/paginate.interface';
import { PaginationOptionsInterface } from '../../common/paginate';
import { ImmunizationRepository } from './immunization/repositories/immunization.repository';
import { PatientRequestItemRepository } from './repositories/patient_request_items.repository';
import { MailService } from '../mail/mail.service';
import { PatientAlert } from './entities/patient_alert.entity';
import { PatientAlertRepository } from './repositories/patient_alert.repository';
import { HmoSchemeRepository } from '../hmo/repositories/hmo_scheme.repository';
import { ServiceCategoryRepository } from '../settings/services/repositories/service_category.repository';
import { ServiceRepository } from '../settings/services/repositories/service.repository';
import { ServiceCostRepository } from '../settings/services/repositories/service_cost.repository';
import { PatientNoteRepository } from './repositories/patient_note.repository';
import { PatientNote } from './entities/patient_note.entity';
import { StaffRepository } from '../hr/staff/staff.repository';
import { TransactionCreditDto } from '../finance/transactions/dto/transaction-credit.dto';
// @ts-ignore
import * as startCase from 'lodash.startcase';

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
		@InjectRepository(StaffRepository)
		private staffRepository: StaffRepository,
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
					.orWhere('p.legacy_patient_id Like :legacy_patient_id', { legacy_patient_id: `%${q}%` })
					.orWhere('CAST(p.id AS text) Like :id', { id: `%${q}%` });
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
			query.andWhere('p.is_active = :status', { status: status === '1' });
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

			if (patient.next_of_kin_id) {
				patient.nextOfKin = await this.nextOfKinRepository.findOne(patient.next_of_kin_id);
			}

			patient.admission = await this.admissionRepository.findOne({
				where: { status: 0, patient },
			});

			patient.balance = await getBalance(patient.id);
			patient.outstanding = await getOutstanding(patient.id);
			patient.lastAppointment = await getLastAppointment(patient.id);

			if (patient.staff_id) {
				patient.staff = await this.staffRepository.findOne(patient.staff_id);
			}
		}

		return {
			result: patients,
			lastPage: Math.ceil(total / options.limit),
			itemsPerPage: options.limit,
			totalPages: total,
			currentPage: options.page,
		};
	}

	async findPatient(options, param): Promise<Patient[]> {
		const { q, gender, isOpd } = param;

		const query = this.patientRepository.createQueryBuilder('p')
			.select('p.*')
			.andWhere(new Brackets(qb => {
				qb.where('LOWER(p.surname) Like :surname', { surname: `%${q.toLowerCase()}%` })
					.orWhere('LOWER(p.other_names) Like :other_names', { other_names: `%${q.toLowerCase()}%` })
					// .orWhere('LOWER(p.email) Like :email', { email: `%${q.toLowerCase()}%` })
					.orWhere('p.legacy_patient_id Like :legacy_id', { legacy_id: `%${q}%` })
					// .orWhere('p.phone_number Like :phone', { phone: `%${q}%` })
					.orWhere('CAST(p.id AS text) LIKE :id', { id: `%${q}%` });
			}));

		if (isOpd && isOpd !== '') {
			const isOutPatient = (isOpd === 1);
			query.andWhere('p.is_out_patient Like :isOutPatient', { isOutPatient });
		}

		if (gender && gender !== '') {
			query.andWhere('p.gender = :gender', { gender });
		}

		const patients = await query.take(options.limit).getRawMany();

		for (const patient of patients) {
			patient.immunization = await this.immunizationRepository.find({
				where: { patient },
			});

			if (patient.hmo_scheme_id) {
				patient.hmo = await this.hmoSchemeRepository.findOne(patient.hmo_scheme_id);
			}

			if (patient.next_of_kin_id) {
				patient.nextOfKin = await this.nextOfKinRepository.findOne(patient.next_of_kin_id);
			}

			patient.balance = await getBalance(patient.id);
			patient.outstanding = await getOutstanding(patient.id);
			patient.lastAppointment = await getLastAppointment(patient.id);

			if (patient.staff_id) {
				patient.staff = await this.staffRepository.findOne(patient.staff_id);
			}

			patient.admission = await this.admissionRepository.findOne({
				where: { status: 0, patient },
			});
		}

		return patients;
	}

	async saveNewPatient(patientDto: PatientDto, createdBy: string): Promise<any> {
		const queryRunner = getConnection().createQueryRunner();
		await queryRunner.startTransaction();

		try {
			const { hmo_id, staff_id } = patientDto;

			const hmo = await this.hmoSchemeRepository.findOne(hmo_id);

			let nok = await this.patientNOKRepository.findOne({
				where: [{ phoneNumber: patientDto.nok_phoneNumber }, { email: patientDto.nok_email }],
			});

			if (!nok) {
				nok = await this.patientNOKRepository.saveNOK(patientDto);
			}

			let staff;
			if (staff_id) {
				staff = await this.staffRepository.findOne(staff_id);
			}

			let serviceCost;
			const category = await this.serviceCategoryRepository.findOne({ where: { name: 'registration' } });
			const service = await this.serviceRepository.findOne({ where: { category } });
			if (service) {
				serviceCost = await this.serviceCostRepository.findOne({ where: { code: service.code, hmo } });
			}

			if (!serviceCost) {
				serviceCost = await createServiceCost(service.code, hmo);
			}

			const patient = await this.patientRepository.savePatient(patientDto, nok, hmo, createdBy, staff);

			const splits = patient.other_names.split(' ');
			const message = `Dear ${patient.surname} ${splits.length > 0 ? splits[0] : patient.other_names}, welcome to the DEDA Family. Your ID/Folder number is ${formatPID(patient.id)}. Kindly save the number and provide it at all your appointment visits. Thank you.`;

			const data: TransactionCreditDto = {
				patient_id: patient.id,
				username: createdBy,
				sub_total: 0,
				vat: 0,
				amount: serviceCost.tariff * -1,
				voucher_amount: 0,
				amount_paid: 0,
				change: 0,
				description: 'Payment for Patient Registration',
				payment_method: null,
				part_payment_expiry_date: null,
				bill_source: category.name,
				next_location: null,
				status: 0,
				hmo_approval_code: null,
				transaction_details: null,
				admission_id: null,
				staff_id: null,
				lastChangedBy: null,
			};

			await postDebit(data, serviceCost, null, null, null, patient.hmo);

			await queryRunner.commitTransaction();
			await queryRunner.release();

			try {
				const mail = {
					id: patient.id,
					name: `${patient.other_names} ${patient.surname}`,
					email: patient.email,
					phoneNumber: patient.phone_number,
					createdAt: patient.createdAt,
					message,
				};
				await this.mailService.sendMail(mail, 'registration');
			} catch (e) {
				console.log(e);
			}

			const balance = await getBalance(patient.id);
			const outstanding = await getOutstanding(patient.id);

			const pat = { ...patient, outstanding, balance, staff };

			return { success: true, patient: pat };

		} catch (err) {
			await queryRunner.rollbackTransaction();
			await queryRunner.release();
			console.log(err);
			return { success: false, message: err.message };
		}
	}

	async saveNewOpdPatient(patientDto: OpdPatientDto, createdBy: string): Promise<any> {
		try {
			console.log(patientDto);

			const patient = new Patient();
			patient.surname = patientDto.surname.toLocaleLowerCase();
			patient.other_names = patientDto.other_names.toLocaleLowerCase();
			patient.address = patientDto.address.toLocaleLowerCase();
			patient.date_of_birth = moment(patientDto.date_of_birth).format('YYYY-MM-DD');
			patient.gender = patientDto.gender;
			patient.email = patientDto.email;
			patient.phone_number = patientDto.phoneNumber;
			patient.createdBy = createdBy;
			console.log(patient);

			return { success: false, message: 'could not save patient' };

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

	async updatePatientRecord(id: string, patientDto: PatientDto, updatedBy: string): Promise<any> {
		const queryRunner = getConnection().createQueryRunner();
		await queryRunner.startTransaction();
		try {
			const patient = await this.patientRepository.findOne(id, { relations: ['nextOfKin'] });

			const hmo = await this.hmoSchemeRepository.findOne(patientDto.hmo_id);

			patient.surname = startCase(patientDto.surname.toLocaleLowerCase());
			patient.other_names = startCase(patientDto.other_names.toLocaleLowerCase());
			patient.address = startCase(patientDto.address.toLocaleLowerCase());
			patient.date_of_birth = patientDto.date_of_birth;
			patient.occupation = patientDto.occupation || '';
			patient.gender = patientDto.gender;
			patient.email = patientDto.email.toLocaleLowerCase();
			patient.phone_number = patientDto.phone_number;
			patient.maritalStatus = patientDto.maritalStatus;
			patient.ethnicity = patientDto.ethnicity;
			patient.referredBy = patientDto.referredBy;
			patient.profile_pic = patientDto?.avatar || null;
			patient.lastChangedBy = updatedBy;
			patient.hmo = hmo;

			await patient.save();

			if (patient.nextOfKin) {
				const nextOfKin = await this.patientNOKRepository.findOne(patient.nextOfKin.id);
				nextOfKin.surname = patientDto.nok_surname;
				nextOfKin.other_names = patientDto.nok_other_names;
				nextOfKin.address = patientDto?.nok_address || null;
				nextOfKin.date_of_birth = patientDto?.nok_date_of_birth || null;
				nextOfKin.relationship = patientDto?.nok_relationship || null;
				nextOfKin.occupation = patientDto?.nok_occupation || null;
				nextOfKin.gender = patientDto?.nok_gender || null;
				nextOfKin.email = patientDto?.nok_email || null;
				nextOfKin.phoneNumber = patientDto?.nok_phoneNumber || null;
				nextOfKin.maritalStatus = patientDto?.nok_maritalStatus || null;
				nextOfKin.ethnicity = patientDto?.nok_ethnicity || null;
				await nextOfKin.save();
			}

			await queryRunner.commitTransaction();
			await queryRunner.release();

			const result = await this.patientRepository.findOne(id, {
				relations: ['nextOfKin', 'hmo', 'immunization'],
			});

			let serviceCost;
			const category = await this.serviceCategoryRepository.findOne({ where: { name: 'registration' } });
			const service = await this.serviceRepository.findOne({ where: { category } });
			if (service) {
				serviceCost = await this.serviceCostRepository.findOne({ where: { code: service.code, hmo } });
			}

			const registration = await this.transactionsRepository.findOne({
				where: { patient, bill_source: 'registration' },
			});

			if (serviceCost && !patient.legacy_patient_id && !registration) {
				const data: TransactionCreditDto = {
					patient_id: patient.id,
					username: updatedBy,
					sub_total: 0,
					vat: 0,
					amount: serviceCost.tariff * -1,
					voucher_amount: 0,
					amount_paid: 0,
					change: 0,
					description: 'Payment for Patient Registration',
					payment_method: null,
					part_payment_expiry_date: null,
					bill_source: category.name,
					next_location: null,
					status: 0,
					hmo_approval_code: null,
					transaction_details: null,
					admission_id: null,
					staff_id: null,
					lastChangedBy: null,
				};

				await postDebit(data, serviceCost, null, null, null, hmo);
			} else {
				console.log('good to go');
			}

			const balance = await getBalance(patient.id);
			const outstanding = await getOutstanding(patient.id);
			const lastAppointment = await getLastAppointment(patient.id);

			if (patientDto.staff_id) {
				result.staff = await this.staffRepository.findOne(patientDto.staff_id);
			}

			return { success: true, patient: { ...result, balance, outstanding, lastAppointment } };
		} catch (err) {
			console.log(err);
			await queryRunner.rollbackTransaction();
			await queryRunner.release();
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
			.where('t.patient_id = :id', { id })
			.andWhere('t.bill_source != :source', { source: 'credit-deposit' });

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

		const balance = await getBalance(id);
		const outstanding = await getOutstanding(id);

		return {
			result,
			lastPage: Math.ceil(total / options.limit),
			itemsPerPage: options.limit,
			totalPages: total,
			currentPage: options.page,
			total_amount: balance,
			outstanding_amount: outstanding,
		};
	}

	async getAmounts(id): Promise<any> {
		const balance = await getBalance(id);
		const outstanding = await getOutstanding(id);

		return { balance, outstanding };
	}

	async getDeposit(id): Promise<any> {
		const balance = await getDepositBalance(id, true);

		return { balance };
	}

	async getDocuments(options: PaginationOptionsInterface, id, params): Promise<any> {
		const { startDate, endDate, documentType } = params;

		const query = this.patientDocumentRepository.createQueryBuilder('d').select('d.*')
			.where('d.patient_id = :id', { id });

		const page = options.page - 1;

		if (startDate && startDate !== '') {
			const start = moment(startDate).endOf('day').toISOString();
			query.andWhere(`d.createdAt >= '${start}'`);
		}

		if (endDate && endDate !== '') {
			const end = moment(endDate).endOf('day').toISOString();
			query.andWhere(`d.createdAt <= '${end}'`);
		}

		if (documentType && documentType !== '') {
			query.andWhere('d.document_type = :document_type', { document_type: documentType });
		}

		const documents = await query.offset(page * options.limit)
			.limit(options.limit)
			.orderBy('d.createdAt', 'DESC')
			.getRawMany();

		const total = await query.getCount();

		let result = [];
		for (const item of documents) {
			result = [...result, item];
		}

		return {
			result,
			lastPage: Math.ceil(total / options.limit),
			itemsPerPage: options.limit,
			totalPages: total,
			currentPage: options.page,
		};
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
			.where('q.patient_id = :id', { id })
			.andWhere('q.type = :type', { type: 'diagnosis' });

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
		alertItem.read_by = readBy;
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
				requestItem.filled_by = createdBy;
				requestItem.filled_at = moment().format('YYYY-MM-DD HH:mm:ss');
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

	async doSaveCreditLimit(id, param, updatedBy): Promise<any> {
		try {
			const patient = await this.patientRepository.findOne(id);
			patient.credit_limit = param.amount;
			patient.credit_limit_expiry_date = param.expiry_date;
			patient.lastChangedBy = updatedBy;
			const rs = await patient.save();

			return { success: true, patient: rs };
		} catch (error) {
			console.log(error);
			return { success: false, message: error.message };
		}
	}
}
