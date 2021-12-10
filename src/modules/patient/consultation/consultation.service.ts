import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EncounterRepository } from './encounter.repository';
import { EncounterDto } from './dto/encounter.dto';
import { Encounter } from './encouter.entity';
import { AppointmentRepository } from '../../frontdesk/appointment/appointment.repository';
import { PatientRepository } from '../repositories/patient.repository';
import { PatientRequestHelper } from '../../../common/utils/PatientRequestHelper';
import { RequestPaymentHelper } from '../../../common/utils/RequestPaymentHelper';
import { PaginationOptionsInterface } from '../../../common/paginate';
import * as moment from 'moment';
import { PatientNote } from '../entities/patient_note.entity';
import { AppGateway } from '../../../app.gateway';
import { QueueSystemRepository } from '../../frontdesk/queue-system/queue-system.repository';
import { PatientConsumable } from '../entities/patient_consumable.entity';
import { Appointment } from '../../frontdesk/appointment/appointment.entity';
import { AuthRepository } from '../../auth/auth.repository';
import { Connection, getConnection, getRepository } from 'typeorm';
import { getStaff } from '../../../common/utils/utils';
import { PatientNoteRepository } from '../repositories/patient_note.repository';
import { DrugGenericRepository } from '../../inventory/pharmacy/generic/generic.repository';
import { StoreInventoryRepository } from '../../inventory/store/store.repository';

@Injectable()
export class ConsultationService {
	constructor(
		private connection: Connection,
		private readonly appGateway: AppGateway,
		@InjectRepository(EncounterRepository)
		private encounterRepository: EncounterRepository,
		@InjectRepository(PatientRepository)
		private patientRepository: PatientRepository,
		@InjectRepository(AppointmentRepository)
		private appointmentRepository: AppointmentRepository,
		@InjectRepository(DrugGenericRepository)
		private drugGenericRepository: DrugGenericRepository,
		@InjectRepository(QueueSystemRepository)
		private queueSystemRepository: QueueSystemRepository,
		@InjectRepository(StoreInventoryRepository)
		private storeInventoryRepository: StoreInventoryRepository,
		@InjectRepository(PatientNoteRepository)
		private patientNoteRepository: PatientNoteRepository,
		@InjectRepository(AuthRepository)
		private readonly authRepository: AuthRepository,
	) {
	}

	async getEncounters(options: PaginationOptionsInterface, urlParams): Promise<any> {
		const { startDate, endDate, patient_id } = urlParams;

		const query = this.encounterRepository.createQueryBuilder('e')
			.select('e.*');

		if (startDate && startDate !== '') {
			const start = moment(startDate).endOf('day').toISOString();
			query.where(`e.createdAt >= '${start}'`);
		}
		if (endDate && endDate !== '') {
			const end = moment(endDate).endOf('day').toISOString();
			query.andWhere(`e.createdAt <= '${end}'`);
		}

		if (patient_id && patient_id !== '') {
			query.andWhere('e.patient_id = :patient_id', { patient_id });
		}

		const page = options.page - 1;

		const total = await query.getCount();

		const items = await query.orderBy('e.createdAt', 'DESC')
			.take(options.limit)
			.skip(page * options.limit)
			.getRawMany();

		let result = [];
		try {

			for (const item of items) {
				const patient = await this.patientRepository.findOne(item.patient, {
					relations: ['nextOfKin', 'immunization', 'hmo'],
				});

				const staff = await getStaff(item.createdBy);

				item.patient = patient;
				item.staff = staff;

				const pns = await this.patientNoteRepository.createQueryBuilder('pn')
					.where('pn.encounter_id = :id', { id: item.id }).getMany();

				const pc = await getRepository(PatientConsumable).createQueryBuilder('pc')
					.where('pc.encounter_id = :id', { id: item.id }).getMany();

				item.patient_consumables = pc;
				item.patient_notes = pns;

				item.appointment = await this.appointmentRepository.findOne({
					where: { id: item.appointment_id },
					relations: ['whomToSee', 'consultingRoom', 'department'],
				});

				result = [...result, item];
			}

			return {
				result,
				lastPage: Math.ceil(total / options.limit),
				itemsPerPage: options.limit,
				totalPages: total,
				currentPage: options.page,
			};

		} catch (err) {
			return {
				success: false,
				error: `${err.message || 'problem fetching encounter at the moment please try again later'}`,
			};
		}

	}

	async saveEncounter(patientId: number, param: EncounterDto, urlParam, createdBy) {
		const queryRunner = getConnection().createQueryRunner();
		await queryRunner.startTransaction();

		try {
			const { appointment_id } = urlParam;
			const { investigations, nextAppointment } = param;

			const patient = await this.patientRepository.findOne(patientId, { relations: ['hmo'] });

			const appointment = await this.appointmentRepository.findOne({
				where: { id: appointment_id },
				relations: ['patient', 'whomToSee', 'consultingRoom', 'transaction', 'department'],
			});

			const data = new Encounter();
			data.patient = patient;
			data.createdBy = createdBy;
			const encounter = await data.save();

			const complain = param.complaints.replace(/(<([^>]+)>)/gi, '')
				.replace(/&nbsp;/g, '')
				.replace('Presenting Complaints', '')
				.replace('History of complains', '')
				.replace(/\s/g, '')
				.replace(/\/r/g, '')
				.split(':').join('');

			if (encodeURIComponent(complain) !== '%E2%80%8B') {
				const complaint = new PatientNote();
				complaint.description = param.complaints;
				complaint.patient = patient;
				complaint.encounter = encounter;
				complaint.type = 'complaints';
				complaint.visit = 'encounter';
				complaint.createdBy = createdBy;
				await complaint.save();
			}

			const treatmentPlan = param.treatmentPlan.replace(/(<([^>]+)>)/gi, '')
				.replace(/&nbsp;/g, '')
				.replace('Treatment Plan', '')
				.replace(/\s/g, '')
				.replace(/\/r/g, '')
				.split(':').join('');

			if (encodeURIComponent(treatmentPlan) !== '%E2%80%8B') {
				const plan = new PatientNote();
				plan.description = param.treatmentPlan;
				plan.patient = patient;
				plan.encounter = encounter;
				plan.type = 'treatment-plan';
				plan.visit = 'encounter';
				plan.createdBy = createdBy;
				await plan.save();
			}

			if (param.instruction !== '') {
				const instruction = new PatientNote();
				instruction.description = param.instruction;
				instruction.patient = patient;
				instruction.encounter = encounter;
				instruction.type = 'instruction';
				instruction.visit = 'encounter';
				instruction.createdBy = createdBy;
				await instruction.save();
			}

			for (const allergen of param.allergies) {
				const generic = allergen.generic ? await this.drugGenericRepository.findOne(allergen.generic) : null;
				const patientAllergen = new PatientNote();
				patientAllergen.category = allergen.category.value;
				patientAllergen.allergy = allergen.allergen;
				patientAllergen.drugGeneric = generic;
				patientAllergen.severity = allergen.severity.value;
				patientAllergen.reaction = allergen.reaction;
				patientAllergen.patient = patient;
				patientAllergen.encounter = encounter;
				patientAllergen.visit = 'encounter';
				patientAllergen.type = 'allergy';
				patientAllergen.createdBy = createdBy;
				await patientAllergen.save();
			}

			for (const diagnosis of param.diagnosis) {
				const patientDiagnosis = new PatientNote();
				patientDiagnosis.diagnosis = diagnosis.diagnosis;
				patientDiagnosis.status = 'Active';
				patientDiagnosis.patient = patient;
				patientDiagnosis.encounter = encounter;
				patientDiagnosis.diagnosisType = diagnosis.type.value;
				patientDiagnosis.comment = diagnosis.comment;
				patientDiagnosis.visit = 'encounter';
				patientDiagnosis.type = 'diagnosis';
				patientDiagnosis.createdBy = createdBy;
				await patientDiagnosis.save();
			}

			if (param.medicalHistory) {
				const his = param.medicalHistory.replace(/(<([^>]+)>)/gi, '')
					.replace(/&nbsp;/g, '')
					.replace('Past Medical History', '')
					.replace(/\s/g, '')
					.replace(/\/r/g, '')
					.split(':').join('');

				if (encodeURIComponent(his) !== '%E2%80%8B') {
					const patHistory = new PatientNote();
					patHistory.description = param.medicalHistory;
					patHistory.patient = patient;
					patHistory.encounter = encounter;
					patHistory.type = 'medical-history';
					patHistory.visit = 'encounter';
					patHistory.createdBy = createdBy;
					await patHistory.save();
				}
			}

			for (const item of param.patientHistorySelected) {
				const history = new PatientNote();
				history.category = item.category;
				history.history = item.description;
				history.patient = patient;
				history.encounter = encounter;
				history.type = 'patient-history';
				history.visit = 'encounter';
				history.createdBy = createdBy;
				await history.save();
			}

			let physicalExaminations = [];
			for (const exam of param.physicalExamination) {
				physicalExaminations = [...physicalExaminations, `${exam.label}: ${exam.value}`];
			}

			if (physicalExaminations.length > 0) {
				const exam = new PatientNote();
				exam.description = physicalExaminations.join(', ');
				exam.patient = patient;
				exam.encounter = encounter;
				exam.type = 'physical-exam';
				exam.visit = 'encounter';
				exam.createdBy = createdBy;
				await exam.save();
			}

			let reviewOfSystems = [];
			for (const exam of param.reviewOfSystem) {
				reviewOfSystems = [...reviewOfSystems, `${exam.label}: ${exam.value}`];
			}

			if (reviewOfSystems.length > 0) {
				const review = new PatientNote();
				review.description = reviewOfSystems.join(', ');
				review.patient = patient;
				review.encounter = encounter;
				review.type = 'review-of-systems';
				review.visit = 'encounter';
				review.createdBy = createdBy;
				await review.save();
			}

			if (param.consumables) {
				for (const item of param.consumables.items) {
					const consumableItem = await this.storeInventoryRepository.findOne(item.item.id);
					const consumable = new PatientConsumable();
					consumable.quantity = item.quantity;
					consumable.consumable = consumableItem;
					consumable.patient = patient;
					consumable.encounter = encounter;
					consumable.request_note = param.consumables.request_note;
					consumable.createdBy = createdBy;
					await consumable.save();
				}
			}

			if (investigations.labRequest && investigations.labRequest.tests.length > 0) {
				const labRequest = await PatientRequestHelper.handleLabRequest(investigations.labRequest, patient, createdBy);
				if (labRequest.success && labRequest.data.length > 0) {
					// save transaction
					// tslint:disable-next-line:max-line-length
					const payment = await RequestPaymentHelper.clinicalLabPayment(labRequest.data, patient, createdBy, investigations.labRequest.pay_later);
					this.appGateway.server.emit('paypoint-queue', { payment: payment.transactions });
				}
			}

			if (investigations.radiologyRequest && investigations.radiologyRequest.tests.length > 0) {
				const request = await PatientRequestHelper.handleServiceRequest(investigations.radiologyRequest, patient, createdBy, 'scans', 'encounter');
				if (request.success && request.data.length > 0) {
					// save transaction
					const payment = await RequestPaymentHelper.servicePayment(
						request.data,
						patient,
						createdBy,
						'scans',
						investigations.radiologyRequest.pay_later,
					);
					this.appGateway.server.emit('paypoint-queue', { payment: payment.transactions });
				}
			}

			if (investigations.procedureRequest && investigations.procedureRequest.tests.length > 0) {
				const procedure = await PatientRequestHelper.handleServiceRequest(investigations.procedureRequest, patient, createdBy, 'procedure', 'encounter');
				if (procedure.success && procedure.data.length > 0) {
					// save transaction
					const payment = await RequestPaymentHelper.servicePayment(
						procedure.data,
						patient,
						createdBy,
						'procedure',
						investigations.procedureRequest.bill,
					);
					this.appGateway.server.emit('paypoint-queue', { payment: payment.transactions });
				}
			}

			if (investigations.pharmacyRequest) {
				await PatientRequestHelper.handlePharmacyRequest(investigations.pharmacyRequest, patient, createdBy, 'encounter');
			}

			if (nextAppointment && nextAppointment.appointment_date && nextAppointment.appointment_date !== '') {
				const newAppointment = new Appointment();
				newAppointment.patient = patient;
				newAppointment.whomToSee = appointment.whomToSee;
				newAppointment.appointment_date = nextAppointment.appointment_date;
				newAppointment.duration = nextAppointment.duration;
				newAppointment.duration_type = nextAppointment.duration_type;
				newAppointment.serviceCategory = appointment.serviceCategory;
				newAppointment.service = appointment.service;
				newAppointment.description = nextAppointment.description;
				newAppointment.department = appointment.department;
				newAppointment.createdBy = createdBy;
				await newAppointment.save();
			}

			appointment.status = 'Completed';
			appointment.encounter = encounter;
			appointment.lastChangedBy = createdBy;
			const rs = await appointment.save();

			await this.queueSystemRepository.delete({ appointment });

			await queryRunner.commitTransaction();
			await queryRunner.release();

			return { success: true, appointment: { ...rs, encounter } };
		} catch (err) {
			await queryRunner.rollbackTransaction();
			await queryRunner.release();
			console.log(err);
			return { success: false, message: err.message };
		}
	}

	async getEncounter(id: string) {
		return await this.encounterRepository.findOne(id);
	}
}
