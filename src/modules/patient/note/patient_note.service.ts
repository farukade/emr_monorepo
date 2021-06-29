import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PatientRepository } from '../repositories/patient.repository';
import { PatientNoteRepository } from '../repositories/patient_note.repository';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { PatientNote } from '../entities/patient_note.entity';
import { AuthRepository } from '../../auth/auth.repository';
import { getStaff } from '../../../common/utils/utils';

@Injectable()
export class PatientNoteService {
    constructor(
        @InjectRepository(PatientRepository)
        private patientRepository: PatientRepository,
        @InjectRepository(PatientNoteRepository)
        private patientNoteRepository: PatientNoteRepository,
        @InjectRepository(AuthRepository)
        private authRepository: AuthRepository,
    ) {
    }

    async getNotes(options: PaginationOptionsInterface, params): Promise<any> {
        const { patient_id, type, id } = params;

        const page = options.page - 1;

        const patient = await this.patientRepository.findOne(patient_id);

        let result;
        let total = 0;
        if (type && type !== '') {
            if (id && id !== '') {
                [result, total] = await this.patientNoteRepository.findAndCount({
                    where: { patient, type, itemId: id },
                    relations: ['patient'],
                    order: { createdAt: 'DESC' },
                    take: options.limit,
                    skip: (page * options.limit),
                });
            } else {
                [result, total] = await this.patientNoteRepository.findAndCount({
                    where: { patient, type },
                    relations: ['patient'],
                    order: { createdAt: 'DESC' },
                    take: options.limit,
                    skip: (page * options.limit),
                });
            }
        } else {
            if (id && id !== '') {
                [result, total] = await this.patientNoteRepository.findAndCount({
                    where: { patient, itemId: id },
                    relations: ['patient'],
                    order: { createdAt: 'DESC' },
                    take: options.limit,
                    skip: (page * options.limit),
                });
            } else {
                [result, total] = await this.patientNoteRepository.findAndCount({
                    where: { patient },
                    relations: ['patient'],
                    order: { createdAt: 'DESC' },
                    take: options.limit,
                    skip: (page * options.limit),
                });
            }
        }

        let notes = [];
        for (const item of result) {
            const staff = await getStaff(item.createdBy);

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
        const { id, patient_id, description, type, category, specialty } = param;

        const patient = await this.patientRepository.findOne(patient_id);

        const note = new PatientNote();
        note.description = description;
        note.type = type;
        note.category = category;
        note.specialty = specialty;
        note.patient = patient;
        note.itemId = id;
        note.createdBy = createdBy;

        return await note.save();
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
