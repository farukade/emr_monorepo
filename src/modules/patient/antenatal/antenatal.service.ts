import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AntenatalEnrollmentRepository } from './enrollment.repository';
import { EnrollmentDto } from './dto/enrollment.dto';
import { PatientRepository } from '../repositories/patient.repository';
import * as moment from 'moment';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { AntenatalAssessmentRepository } from './antenatal-assessment.repository';
import { PatientRequestRepository } from '../repositories/patient_request.repository';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { getStaff, postDebit } from '../../../common/utils/utils';
import { AntenatalEnrollment } from './entities/antenatal-enrollment.entity';
import { AntenatalPackageRepository } from '../../settings/antenatal-packages/antenatal-package.repository';
import { AdmissionsRepository } from '../admissions/repositories/admissions.repository';
import { Brackets, getConnection, ObjectID } from 'typeorm';
import { PatientNoteRepository } from '../repositories/patient_note.repository';
import { AntenatalAssessment } from './entities/antenatal-assessment.entity';
import { PatientNote } from '../entities/patient_note.entity';
import { PatientRequestHelper } from '../../../common/utils/PatientRequestHelper';
import { RequestPaymentHelper } from '../../../common/utils/RequestPaymentHelper';
import { AppointmentRepository } from '../../frontdesk/appointment/appointment.repository';
import { PatientVitalRepository } from '../repositories/patient_vitals.repository';
import { TransactionCreditDto } from '../../finance/transactions/dto/transaction-credit.dto';
import { AssessmentDto } from './dto/assessment.dto';
import { DoctorsAppointment } from '../../frontdesk/doctors-apointment/appointment.entity';
import { StaffRepository } from '../../hr/staff/staff.repository';
import { DepartmentRepository } from '../../settings/departments/department.repository';

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
		@InjectRepository(StaffRepository)
		private staffRepository: StaffRepository,
		@InjectRepository(DepartmentRepository)
		private departmentRepository: DepartmentRepository,
	) {}

	async getAntenatals(options: PaginationOptionsInterface, urlParams): Promise<Pagination> {
		const { startDate, endDate, patient_id, status } = urlParams;

		const page = options.page - 1;

		const query = this.ancEnrollmentRepository.createQueryBuilder('q').select('q.*');

		if (startDate && startDate !== '') {
			const start = moment(startDate)
				.endOf('day')
				.toISOString();
			query.andWhere(`q.createdAt >= '${start}'`);
		}

		if (endDate && endDate !== '') {
			const end = moment(endDate)
				.endOf('day')
				.toISOString();
			query.andWhere(`q.createdAt <= '${end}'`);
		}

		if (patient_id && patient_id !== '') {
			query.andWhere('q.patient_id = :patient_id', { patient_id });
		}

		if (status && status !== '') {
			query.andWhere('q.status = :status', { status });
		}

		const antenatals = await query
			.offset(page * options.limit)
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

			antenatal.closedBy = await this.staffRepository.findOne(antenatal.closed_by);

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

	async getEnrollment(id: number): Promise<AntenatalEnrollment> {
		return await this.ancEnrollmentRepository.findOne(id, {
			relations: ['patient', 'ancpackage'],
		});
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

			let ancpackage = null;
			if (enrollment_package_id) {
				ancpackage = await this.antenatalPackageRepository.findOne(enrollment_package_id);
			}

			// find patient
			const patient = await this.patientRepository.findOne(patient_id, {
				relations: ['hmo'],
			});

			const admission = await this.admissionsRepository.findOne({
				where: { patient, status: 0 },
			});

			const enrollment = new AntenatalEnrollment();
			enrollment.serial_code = code;
			enrollment.patient = patient;
			enrollment.booking_period = bookingPeriod;
			enrollment.doctors = doctors;
			enrollment.lmp = lmp;
			enrollment.lmp_source = lmpSource;
			enrollment.edd = edd;
			enrollment.father = father;
			enrollment.history = history.description ? history : null;
			enrollment.pregnancy_history = previousPregnancy;
			enrollment.ancpackage = ancpackage;
			enrollment.createdBy = createdBy;
			const rs = await this.ancEnrollmentRepository.save(enrollment);

			if (history.description) {
				const patientHistory = new PatientNote();
				patientHistory.category = history.category;
				patientHistory.history = history.description;
				patientHistory.patient = patient;
				patientHistory.type = 'patient-history';
				patientHistory.antenatal = rs;
				patientHistory.createdBy = createdBy;
				await patientHistory.save();
			}

			patient.antenatal_id = rs.id;
			await patient.save();

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
					admission_id: admission?.id || null,
					nicu_id: null,
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

	async getAssessments(id: number, options: PaginationOptionsInterface): Promise<Pagination> {
		const page = options.page - 1;

		const query = this.antenatalAssessmentRepository
			.createQueryBuilder('q')
			.select('q.*')
			.where('q.antenatal_enrollment_id = :antenatal_id', { antenatal_id: id });

		const visits = await query
			.offset(page * options.limit)
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

	async saveAntenatalAssessment(id: number, params: AssessmentDto, username: string) {
		try {
			const { comment, measurement, labRequest, radiologyRequest, pharmacyRequest, nextAppointment, appointment_id } = params;

			const antenatalEnrolment = await this.ancEnrollmentRepository.findOne(id, {
				relations: ['ancpackage', 'patient'],
			});
			const patient_id = antenatalEnrolment.patient.id;
			const patient = await this.patientRepository.findOne(patient_id, {
				relations: ['hmo'],
			});

			const appointment =
				appointment_id && appointment_id !== ''
					? await this.appointmentRepository.findOne({
							where: { id: appointment_id },
							relations: ['patient', 'whomToSee', 'consultingRoom', 'transaction', 'department'],
					  })
					: null;

			const admission = await this.admissionsRepository.findOne({
				where: { patient, status: 0 },
			});

			let savedNote = null;
			if (comment) {
				const note = new PatientNote();
				note.patient = patient;
				note.description = comment;
				note.type = 'anc-comment';
				note.antenatal = antenatalEnrolment;
				note.admission = admission;
				note.createdBy = username;
				savedNote = await note.save();
			}

			const assessment = new AntenatalAssessment();
			assessment.antenatalEnrolment = antenatalEnrolment;
			assessment.patient = patient;
			assessment.measurement = measurement.vitals;
			assessment.position_of_foetus = measurement.position_of_foetus;
			assessment.fetal_lie = measurement.fetal_lie;
			assessment.relationship_to_brim = measurement.brim;
			assessment.comment = savedNote;
			assessment.createdBy = username;
			assessment.next_appointment_date = nextAppointment.datetime || null;
			const rs = await assessment.save();

			if (measurement && measurement.vitals) {
				const vitals = measurement.vitals;
				if (vitals.fetal_heart_rate && vitals.fetal_heart_rate !== '') {
					const reading = { fetal_heart_rate: vitals.fetal_heart_rate };
					const data = {
						readingType: 'Fetal Heart Rate',
						reading,
						patient,
						createdBy: username,
					};
					await this.patientVitalRepository.save(data);
				}

				if (vitals.height_of_fundus && vitals.height_of_fundus !== '') {
					const reading = { fundus_height: vitals.height_of_fundus };
					const data = {
						readingType: 'Fundus Height',
						reading,
						patient,
						createdBy: username,
					};
					await this.patientVitalRepository.save(data);
				}
			}

			if (labRequest) {
				const request = { ...labRequest, antenatal_id: id };
				const lab = await PatientRequestHelper.handleLabRequest(request, patient, username);
				if (lab.success) {
					await RequestPaymentHelper.clinicalLabPayment(lab.data, patient, username, 0);
				}
			}

			if (radiologyRequest) {
				const request = { ...radiologyRequest, antenatal_id: id };
				const scan = await PatientRequestHelper.handleServiceRequest(request, patient, username, 'scans', '');
				if (scan.success) {
					await RequestPaymentHelper.servicePayment(scan.data, patient, username, 'scans', 0);
				}
			}

			if (pharmacyRequest) {
				const request = { ...pharmacyRequest, antenatal_id: id };
				await PatientRequestHelper.handlePharmacyRequest(request, patient, username);
			}

			if (nextAppointment && nextAppointment.datetime && nextAppointment.datetime !== '') {
				const doctor = await this.staffRepository.findOne(nextAppointment.doctor_id);

				const department_id = appointment?.department?.id || null;
				let department = department_id ? await this.departmentRepository.findOne(department_id) : null;
				if (!department) {
					department = await this.departmentRepository.findOne({
						where: { slug: 'antenatal' },
					});
				}

				const date = moment(nextAppointment.datetime);

				const newAppointment = new DoctorsAppointment();
				newAppointment.patient = patient;
				newAppointment.doctor = doctor;
				newAppointment.appointment_datetime = nextAppointment.datetime;
				newAppointment.appointment_date = date.format('YYYY-MM-DD');
				newAppointment.appointment_time = date.format('HH:mm:ss');
				newAppointment.appointment_duration = {
					duration: nextAppointment.duration,
					duration_type: nextAppointment.duration_type,
				};
				newAppointment.department = department;
				newAppointment.createdBy = username;
				await newAppointment.save();
			}

			if (appointment) {
				appointment.status = 'Completed';
				appointment.assessment = rs;
				await appointment.save();
			}

			return { success: true, assessment, appointment };
		} catch (err) {
			console.log(err);
			return { success: false, message: err.message };
		}
	}

	async close(id: number, params: any, username: string): Promise<any> {
		try {
			const enrollment = await this.ancEnrollmentRepository.findOne(id, {
				relations: ['patient'],
			});
			if (!enrollment) {
				return { success: false, message: 'antenatal enrollment not found' };
			}

			enrollment.date_closed = moment().format('YYYY-MM-DD HH:mm:ss');
			enrollment.closedBy = await getStaff(username);
			enrollment.status = 1;
			enrollment.lastChangedBy = username;
			const rs = await enrollment.save();

			const patient = await this.patientRepository.findOne(enrollment.patient.id);
			patient.antenatal_id = null;
			await patient.save();

			rs.closedBy = await getStaff(username);

			return { success: true, enrollment: rs };
		} catch (err) {
			return { success: false, message: err.message };
		}
	}
}
