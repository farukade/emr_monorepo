import { Injectable, NotFoundException, Delete } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AntenatalEnrollmentRepository } from './enrollment.repository';
import { EnrollmentDto } from './dto/enrollment.dto';
import { PatientRepository } from '../repositories/patient.repository';
import { PatientAntenatal } from '../entities/patient_antenatal.entity';
import * as moment from 'moment';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { AntenatalAssessmentRepository } from './antenatal-assessment.repository';
import { PatientRequestRepository } from '../repositories/patient_request.repository';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { getStaff, postDebit } from '../../../common/utils/utils';
import { AntenatalEnrollment } from './entities/antenatal-enrollment.entity';
import { AntenatalPackageRepository } from '../../settings/antenatal-packages/antenatal-package.repository';
import { AdmissionsRepository } from '../admissions/repositories/admissions.repository';
import { Brackets, getConnection } from 'typeorm';
import { PatientNoteRepository } from '../repositories/patient_note.repository';
import { AntenatalAssessment } from './entities/antenatal-assessment.entity';
import { PatientNote } from '../entities/patient_note.entity';
import { PatientRequestHelper } from '../../../common/utils/PatientRequestHelper';
import { RequestPaymentHelper } from '../../../common/utils/RequestPaymentHelper';
import { Appointment } from '../../frontdesk/appointment/appointment.entity';
import { AppointmentRepository } from '../../frontdesk/appointment/appointment.repository';
import { PatientVitalRepository } from '../repositories/patient_vitals.repository';
import { TransactionCreditDto } from '../../finance/transactions/dto/transaction-credit.dto';

@Injectable()
export class AntenatalService {
	constructor(
		@InjectRepository(AntenatalEnrollmentRepository)
		private ancEnrollmentRepository: AntenatalEnrollmentRepository,
		@InjectRepository(PatientRepository)
		private patientRepository: PatientRepository,
		@InjectRepository(AntenatalAssessmentRepository)
		private antenatalAssessmentRepository: AntenatalAssessmentRepository,
		@InjectRepository(PatientRequestRepository)
		private patientRequestRepository: PatientRequestRepository,
		@InjectRepository(AntenatalPackageRepository)
		private antenatalPackageRepository: AntenatalPackageRepository,
		@InjectRepository(AdmissionsRepository)
		private admissionsRepository: AdmissionsRepository,
		@InjectRepository(PatientNoteRepository)
		private patientNoteRepository: PatientNoteRepository,
		@InjectRepository(AppointmentRepository)
		private appointmentRepository: AppointmentRepository,
		@InjectRepository(PatientVitalRepository)
		private patientVitalRepository: PatientVitalRepository,
	) {
	}

	async getAntenatals(options: PaginationOptionsInterface, urlParams): Promise<Pagination> {
		const { startDate, endDate, patient_id } = urlParams;

		const page = options.page - 1;

		const query = this.ancEnrollmentRepository.createQueryBuilder('q').select('q.*');

		if (startDate && startDate !== '') {
			const start = moment(startDate).endOf('day').toISOString();
			query.andWhere(`q.createdAt >= '${start}'`);
		}

		if (endDate && endDate !== '') {
			const end = moment(endDate).endOf('day').toISOString();
			query.andWhere(`q.createdAt <= '${end}'`);
		}

		if (patient_id && patient_id !== '') {
			query.andWhere('q.patient_id = :patient_id', { patient_id });
		}

		const antenatals = await query.offset(page * options.limit)
			.limit(options.limit)
			.orderBy('q.createdAt', 'DESC')
			.getRawMany();

		const total = await query.getCount();

		let result = [];
		for (const antenatal of antenatals) {
			antenatal.patient = await this.patientRepository.findOne(antenatal.patient_id, {
				relations: ['nextOfKin', 'immunization', 'hmo'],
			});

			antenatal.staff = await getStaff(antenatal.createdBy);
			antenatal.ancpackage = antenatal.package_id ? await this.antenatalPackageRepository.findOne(antenatal.package_id) : null;

			result = [...result, antenatal];
		}

		return {
			result,
			lastPage: Math.ceil(total / options.limit),
			itemsPerPage: options.limit,
			totalPages: total,
			currentPage: options.page,
		};
	}

	async searchEnrollment(options, param): Promise<AntenatalEnrollment[]> {
		const { q } = param;

		const query = this.ancEnrollmentRepository.createQueryBuilder('p')
			.select('p.*')
			.andWhere(new Brackets(qb => {
				qb.where('LOWER(p.serial_code) Like :code', { code: `%${q.toLowerCase()}%` })
				.orWhere('CAST(p.patient_id AS text) LIKE :id', { id: `%${q}%` });
			}));

		const antenatals = await query.take(options.limit).getRawMany();

		for (const antenatal of antenatals) {
			antenatal.patient = await this.patientRepository.findOne(antenatal.patient_id, {
				relations: ['nextOfKin', 'immunization', 'hmo'],
			});
		}

		return antenatals;
	}

	async saveEnrollment(createDto: EnrollmentDto, createdBy) {
		try {
			const { patient_id, bookingPeriod, doctors, lmp, lmpSource, edd, father, history, previousPregnancy, enrollment_package_id } = createDto;

			const requestCount = await getConnection()
				.createQueryBuilder()
				.select('*')
				.from(AntenatalEnrollment, 'q')
				.withDeleted()
				.getCount();

			const nextId = `00000${requestCount + 1}`;
			const code = `ANC${moment().format('YY')}/${moment().format('MM')}/${nextId.slice(-5)}`;

			const ancpackage = await this.antenatalPackageRepository.findOne(enrollment_package_id);

			// find patient
			const patient = await this.patientRepository.findOne(patient_id, { relations: ['hmo'] });

			const admission = await this.admissionsRepository.findOne({ where: { patient } });

			const enrollment = new AntenatalEnrollment();
			enrollment.serial_code = code;
			enrollment.patient = patient;
			enrollment.booking_period = bookingPeriod;
			enrollment.doctors = doctors;
			enrollment.lmp = lmp;
			enrollment.lmp_source = lmpSource;
			enrollment.edd = edd;
			enrollment.father = father;
			enrollment.history = history;
			enrollment.pregnancy_history = previousPregnancy;
			enrollment.ancpackage = ancpackage;
			enrollment.createdBy = createdBy;
			const rs = await this.ancEnrollmentRepository.save(enrollment);

			if (ancpackage) {
				const data: TransactionCreditDto = {
					patient_id: patient.id,
					username: createdBy,
					sub_total: 0,
					vat: 0,
					amount: ancpackage.amount * -1,
					voucher_amount: 0,
					amount_paid: 0,
					change: 0,
					description: 'Payment for ANC',
					payment_method: null,
					part_payment_expiry_date: null,
					bill_source: 'anc',
					next_location: null,
					status: -1,
					hmo_approval_code: null,
					transaction_details: null,
					admission_id: null,
					staff_id: null,
					lastChangedBy: null,
				};

				await postDebit(data, null, null, null, null, patient.hmo);
			}

			return { success: true, enrollment: rs };
		} catch (error) {
			console.log(error);
			return { success: false, message: error.message };
		}
	}

	async saveLMP(id: number, createDto: EnrollmentDto, createdBy) {
		try {
			const { lmp, edd } = createDto;

			const enrollment = await this.ancEnrollmentRepository.findOne(id);
			enrollment.lmp = lmp;
			enrollment.edd = edd;
			enrollment.lastChangedBy = createdBy;
			const rs = await enrollment.save();

			return { success: true, data: rs };
		} catch (error) {
			console.log(error);
			return { success: false, message: error.message };
		}
	}

	async deleteAntenatal(id: string) {
		// delete Antenatal rates
		await this.patientRequestRepository
			.createQueryBuilder()
			.delete()
			.where('Antenatal_id = :id', { id })
			.execute();
		// delete Antenatal
		const result = await this.patientRequestRepository.delete(id);

		if (result.affected === 0) {
			throw new NotFoundException(`Antenatal with ID '${id}' not found`);
		}
		const antenatal = new PatientAntenatal();
		antenatal.id = Number(id);
		return antenatal;
	}

	async getAssessments(id: number, options: PaginationOptionsInterface): Promise<Pagination> {
		const page = options.page - 1;

		const query = this.antenatalAssessmentRepository.createQueryBuilder('q')
			.select('q.*')
			.where('q.antenatal_enrollment_id = :antenatal_id', { antenatal_id: id });

		const visits = await query.offset(page * options.limit)
			.limit(options.limit)
			.orderBy('q.createdAt', 'DESC')
			.getRawMany();

		const total = await query.getCount();

		let results = [];
		for (const item of visits) {
			item.staff = await getStaff(item.createdBy);
			if (item.note_id) {
				item.comment = await this.patientNoteRepository.findOne(item.note_id);
			}

			results = [...results, item];
		}

		return {
			result: results,
			lastPage: Math.ceil(total / options.limit),
			itemsPerPage: options.limit,
			totalPages: total,
			currentPage: options.page,
		};
	}

	async saveAntenatalAssessment(id, params, createdBy: string) {
		try {
			const {
				measurement,
				position_of_foetus,
				fetal_lie,
				brim,
				comment,
				investigation,
				nextAppointment,
				appointment_id,
			} = params;
			const { labRequest, radiologyRequest, pharmacyRequest } = investigation;

			const antenatalEnrolment = await this.ancEnrollmentRepository.findOne(id, {
				relations: ['ancpackage', 'patient'],
			});
			const patient_id = antenatalEnrolment.patient.id;
			const patient = await this.patientRepository.findOne(patient_id, { relations: ['hmo'] });

			const appointment = appointment_id && appointment_id !== '' ? await this.appointmentRepository.findOne({
				where: { id: appointment_id },
				relations: ['patient', 'whomToSee', 'consultingRoom', 'transaction', 'department'],
			}) : null;

			let savedNote = null;
			if (comment) {
				const note = new PatientNote();
				note.patient = patient;
				note.description = comment;
				note.type = 'anc-comment';
				note.antenatal = antenatalEnrolment;
				note.createdBy = createdBy;
				savedNote = await note.save();
			}

			const assessment = new AntenatalAssessment();
			assessment.antenatalEnrolment = antenatalEnrolment;
			assessment.patient = patient;
			assessment.measurement = measurement;
			assessment.position_of_foetus = position_of_foetus;
			assessment.fetal_lie = fetal_lie;
			assessment.relationship_to_brim = brim;
			assessment.comment = savedNote;
			assessment.createdBy = createdBy;
			assessment.next_appointment_date = nextAppointment.date || null;
			const rs = await assessment.save();

			if (measurement) {
				if (measurement.fetal_heart_rate && measurement.fetal_heart_rate !== '') {
					const reading = { fetal_heart_rate: measurement.fetal_heart_rate };
					const data = { readingType: 'Fetal Heart Rate', reading, patient, createdBy };
					await this.patientVitalRepository.save(data);
				}

				if (measurement.height_of_fundus && measurement.height_of_fundus !== '') {
					const reading = { fundus_height: measurement.height_of_fundus };
					const data = { readingType: 'Fundus Height', reading, patient, createdBy };
					await this.patientVitalRepository.save(data);
				}
			}

			if (labRequest) {
				// tslint:disable-next-line:max-line-length
				const request = {
					requestType: 'labs',
					request_note: labRequest.lab_note || null,
					tests: labRequest.lab_tests,
					urgent: labRequest.lab_urgent || false,
					antenatal_id: id,
				};
				console.log(request);
				const lab = await PatientRequestHelper.handleLabRequest(request, patient, createdBy);
				if (lab.success) {
					await RequestPaymentHelper.clinicalLabPayment(lab.data, patient, createdBy, 0);
				}
			}

			if (radiologyRequest) {
				// tslint:disable-next-line:max-line-length
				const request = {
					requestType: 'scans',
					request_note: radiologyRequest.scan_note || null,
					tests: radiologyRequest.scans,
					urgent: radiologyRequest.scan_urgent || false,
					antenatal_id: id,
				};
				const scan = await PatientRequestHelper.handleServiceRequest(request, patient, createdBy, 'scans');
				if (scan.success) {
					await RequestPaymentHelper.servicePayment(scan.data, patient, createdBy, 'scans', 0);
				}
			}

			if (pharmacyRequest) {
				// tslint:disable-next-line:max-line-length
				const request = {
					requestType: 'drugs',
					request_note: pharmacyRequest.regimen_note || null,
					items: pharmacyRequest.prescriptions,
					antenatal_id: id,
				};
				await PatientRequestHelper.handlePharmacyRequest(request, patient, createdBy);
			}

			if (nextAppointment && nextAppointment.date && nextAppointment.date !== '') {
				const newAppointment = new Appointment();
				newAppointment.patient = patient;
				newAppointment.whomToSee = nextAppointment.whomToSee;
				newAppointment.appointment_date = nextAppointment.date;
				newAppointment.duration = nextAppointment.duration;
				newAppointment.duration_type = nextAppointment.time;
				newAppointment.serviceCategory = nextAppointment.serviceCategory;
				newAppointment.service = nextAppointment.service;
				newAppointment.department = nextAppointment.department;
				newAppointment.createdBy = createdBy;
				await newAppointment.save();
			}

			if (appointment) {
				appointment.status = 'Completed';
				appointment.assessment = rs;
				await appointment.save();
			}

			return { success: true, assessment };
		} catch (err) {
			console.log(err);
			return { success: false, message: err.message };
		}
	}
}
