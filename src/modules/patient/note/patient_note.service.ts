import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PatientRepository } from '../repositories/patient.repository';
import { PatientNoteRepository } from '../repositories/patient_note.repository';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { PatientNote } from '../entities/patient_note.entity';
import { getStaff } from '../../../common/utils/utils';
import { AdmissionsRepository } from '../admissions/repositories/admissions.repository';
import { PatientRequestItemRepository } from '../repositories/patient_request_items.repository';
import { IvfEnrollmentRepository } from '../ivf/ivf_enrollment.repository';
import { AntenatalEnrollmentRepository } from '../antenatal/enrollment.repository';
import { DrugGenericRepository } from '../../inventory/pharmacy/generic/generic.repository';
import { LabourEnrollmentRepository } from '../labour-management/repositories/labour-enrollment.repository';
import { NicuRepository } from '../nicu/nicu.repository';
import { PatientAlertRepository } from '../repositories/patient_alert.repository';
import * as moment from 'moment';
import { EncounterRepository } from '../consultation/encounter.repository';
import { Brackets } from 'typeorm';

@Injectable()
export class PatientNoteService {
	constructor(
		@InjectRepository(PatientRepository)
		private patientRepository: PatientRepository,
		@InjectRepository(PatientNoteRepository)
		private patientNoteRepository: PatientNoteRepository,
		@InjectRepository(AdmissionsRepository)
		private admissionsRepository: AdmissionsRepository,
		@InjectRepository(PatientRequestItemRepository)
		private patientRequestItemRepository: PatientRequestItemRepository,
		@InjectRepository(IvfEnrollmentRepository)
		private ivfEnrollmentRepository: IvfEnrollmentRepository,
		@InjectRepository(AntenatalEnrollmentRepository)
		private enrollmentRepository: AntenatalEnrollmentRepository,
		@InjectRepository(DrugGenericRepository)
		private drugGenericRepository: DrugGenericRepository,
		@InjectRepository(LabourEnrollmentRepository)
		private labourEnrollmentRepository: LabourEnrollmentRepository,
		@InjectRepository(NicuRepository)
		private nicuRepository: NicuRepository,
		@InjectRepository(PatientAlertRepository)
		private patientAlertRepository: PatientAlertRepository,
		@InjectRepository(EncounterRepository)
		private encounterRepository: EncounterRepository,
	) {}

	async getNotes(options: PaginationOptionsInterface, params): Promise<any> {
		const { patient_id, type, category, admission_id, visit, ivf_id, antenatal_id, procedure_id, labour_id, nicu_id } = params;

		const query = this.patientNoteRepository.createQueryBuilder('q').select('q.*');

		if (patient_id && patient_id !== '') {
			query.andWhere('q.patient_id = :patient_id', { patient_id });
		}

		if (visit && visit !== '') {
			query.andWhere('q.visit = :visit', { visit });
		}

		if (admission_id && admission_id !== '') {
			query.andWhere('q.admission_id = :admission_id', { admission_id });
		}

		if (ivf_id && ivf_id !== '') {
			query.andWhere('q.ivf_id = :ivf_id', { ivf_id });
		}

		if (antenatal_id && antenatal_id !== '') {
			query.andWhere('q.antenatal_id = :antenatal_id', { antenatal_id });
		}

		if (procedure_id && procedure_id !== '') {
			query.andWhere('q.request_item_id = :procedure_id', { procedure_id });
		}

		if (labour_id && labour_id !== '') {
			query.andWhere('q.labour_id = :labour_id', { labour_id });
		}

		if (nicu_id && nicu_id !== '') {
			query.andWhere('q.nicu_id = :nicu_id', { nicu_id });
		}

		if (type && type !== '') {
			const types = type.split('|');
			if (types.length <= 1) {
				query.andWhere('q.type = :type', { type });
			} else {
				query.andWhere(
					new Brackets(qb => {
						qb.where('q.type = :type1', { type1: types[0] }).orWhere('q.type = :type2', { type2: types[1] });
					}),
				);
			}
		}

		if (category && category !== '') {
			query.andWhere('q.category = :category', { category });
		}

		const page = options.page - 1;

		const items = await query
			.offset(page * options.limit)
			.limit(options.limit)
			.orderBy('q.createdAt', 'DESC')
			.getRawMany();

		const total = await query.getCount();

		let notes = [];
		for (const item of items) {
			const staff = await getStaff(item.createdBy);

			if (item.drug_generic_id && item.drug_generic_id !== '') {
				item.generic = await this.drugGenericRepository.findOne(item.drug_generic_id);
			}

			notes = [...notes, { ...item, staff }];
		}

		return {
			result: notes,
			lastPage: Math.ceil(total / options.limit),
			itemsPerPage: options.limit,
			totalPages: total,
			currentPage: options.page,
		};
	}

	async saveNote(param: any, createdBy: string) {
		const { patient_id, description, type, admission_id, note_type, specialty, procedure_id, ivf_id, antenatal_id, labour_id, nicu_id, encounter_id, category, history } = param;

		const patient = await this.patientRepository.findOne(patient_id);

		const note = new PatientNote();
		note.patient = patient;
		note.description = description;
		note.history = history;
		note.type = type;

		if (type === 'consultation') {
			note.visit = 'encounter';
		}

		if (admission_id && admission_id !== '') {
			note.admission = await this.admissionsRepository.findOne(admission_id);
		}

		if (procedure_id && procedure_id !== '') {
			note.request = await this.patientRequestItemRepository.findOne(procedure_id);
		}

		if (ivf_id && ivf_id !== '') {
			note.ivf = await this.ivfEnrollmentRepository.findOne(ivf_id);
		}

		if (antenatal_id && antenatal_id !== '') {
			note.antenatal = await this.enrollmentRepository.findOne(antenatal_id);
		}

		if (labour_id && labour_id !== '') {
			note.labour = await this.labourEnrollmentRepository.findOne(labour_id);
		}

		if (encounter_id && encounter_id !== '') {
			note.encounter = await this.encounterRepository.findOne(encounter_id);
		}

		if (nicu_id && nicu_id !== '') {
			note.nicu = await this.nicuRepository.findOne(nicu_id);
		}

		note.specialty = specialty;
		note.note_type = note_type;
		note.category = category;
		note.createdBy = createdBy;

		const rs = await note.save();

		const staff = await getStaff(createdBy);

		return { ...rs, note_type: rs.note_type, staff };
	}

	async updateNote(id: number, param: any, username: string) {
		try {
			const note = await this.patientNoteRepository.findOne(id);
			note.lastChangedBy = username;
			await note.save();

			return { success: true, data: note };
		} catch (e) {
			return { success: false, message: e.message };
		}
	}

	async resolveDiagnosis(id: number, username: string) {
		try {
			const note = await this.patientNoteRepository.findOne(id);
			note.status = 'Resolved';
			note.resolved_by = username;
			note.resolved_at = moment().format('YYYY-MM-DD HH:mm:ss');
			note.lastChangedBy = username;
			await note.save();

			const alertItem = await this.patientAlertRepository.findOne({
				item_id: id,
				category: 'critical',
			});
			if (alertItem) {
				alertItem.closed = true;
				alertItem.closed_by = username;
				alertItem.closed_at = moment().format('YYYY-MM-DD HH:mm:ss');
				alertItem.lastChangedBy = username;

				await alertItem.save();
			}

			return { success: true, data: note };
		} catch (e) {
			return { success: false, message: e.message };
		}
	}

	async deleteNote(id: number, username: string) {
		const note = await this.patientNoteRepository.findOne(id);

		if (!note) {
			throw new NotFoundException(`Note with ID '${id}' not found`);
		}

		note.deletedBy = username;
		await note.save();

		return note.softRemove();
	}
}
