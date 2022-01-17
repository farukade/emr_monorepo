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
    ) {
    }

    async getNotes(options: PaginationOptionsInterface, params): Promise<any> {
        const { patient_id, type, admission_id, visit, ivf_id, antenatal_id, procedure_id, labour_id } = params;

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

        if (type && type !== '') {
            query.andWhere('q.type = :type', { type });
        }

        const page = options.page - 1;

        const items = await query.offset(page * options.limit)
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

    async saveNote(param, createdBy) {
        const { patient_id, description, type, admission_id, note_type, specialty, procedure_id, ivf_id, antenatal_id, labour_id } = param;

        const patient = await this.patientRepository.findOne(patient_id);

        const note = new PatientNote();
        note.patient = patient;
        note.description = description;
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

        note.specialty = specialty;
        note.noteType = note_type;
        note.createdBy = createdBy;

        const rs = await note.save();

        const staff = await getStaff(createdBy);

        return { ...rs, note_type: rs.noteType, staff };
    }

    async updateNote(id: number, param, username: string) {
        try {
            const note = await this.patientNoteRepository.findOne(id);
            note.lastChangedBy = username;
            await note.save();

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
