import { Injectable, NotFoundException, Delete } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PatientAllergyDto } from '../dto/patient.allergy.dto';
import { PatientRepository } from '../repositories/patient.repository';
import { Raw } from 'typeorm';
import { PatientAllergenRepository } from '../repositories/patient_allergen.repository';

@Injectable()
export class PatientAllergenService {
    constructor(
        @InjectRepository(PatientAllergenRepository)
        private patientAllergyRepository: PatientAllergenRepository,
        @InjectRepository(PatientRepository)
        private patientRepository: PatientRepository,
    ) {

    }

    async getAllergies(options, urlParams): Promise<any> {
        const { q, patient_id } = urlParams;

        const page = options.page - 1;

        let result;
        let total = 0;

        const patient = await this.patientRepository.findOne(patient_id);

        if (q && q.length > 0) {
            [result, total] = await this.patientAllergyRepository.findAndCount({
                where: { name: Raw(alias => `LOWER(${alias}) Like '%${q.toLowerCase()}%'`), patient },
                relations: ['patient'],
                take: options.limit,
                skip: (page * options.limit),
            });
        } else {
            [result, total] = await this.patientAllergyRepository.findAndCount({
                where: { patient },
                relations: ['patient'],
                take: options.limit,
                skip: (page * options.limit),
            });
        }

        return {
            result,
            lastPage: Math.ceil(total / options.limit),
            itemsPerPage: options.limit,
            totalPages: total,
            currentPage: options.page,
        };
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

    async deleteAllergen(id: number, username) {
        const allergen = await this.patientAllergyRepository.findOne(id);

        if (!allergen) {
            throw new NotFoundException(`Patient allergen with ID '${id}' not found`);
        }

        allergen.deletedBy = username;
        await allergen.save();

        return allergen.softRemove();
    }
}
