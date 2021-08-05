import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PatientConsumableRepository } from './patient-consumable.repository';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { PatientConsumable } from '../entities/patient_consumable.entity';
import { PatientConsumableDto } from './dto/consumable.dto';
import { PatientRepository } from '../repositories/patient.repository';
import { Raw } from 'typeorm';

@Injectable()
export class PatientConsumableService {
    constructor(
        @InjectRepository(PatientConsumableRepository)
        private consumableRepository: PatientConsumableRepository,
        @InjectRepository(PatientRepository)
        private patientRepository: PatientRepository,
    ) {

    }

    async getConsumables(options: PaginationOptionsInterface, urlParams): Promise<any> {
        const { q, patient_id } = urlParams;

        const page = options.page - 1;

        let result;
        let total = 0;

        const patient = await this.patientRepository.findOne(patient_id);

        if (q && q.length > 0) {
            [result, total] = await this.consumableRepository.findAndCount({
                where: { name: Raw(alias => `LOWER(${alias}) Like '%${q.toLowerCase()}%'`), patient },
                relations: ['patient'],
                take: options.limit,
                skip: (page * options.limit),
            });
        } else {
            [result, total] = await this.consumableRepository.findAndCount({
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

    async saveConsumable(param: PatientConsumableDto, createdBy): Promise<any> {
        try {
            const { patient_id } = param;
            const patient = await this.patientRepository.findOne(patient_id);
            const consumable = null;
            return { success: true, consumable };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async updateConsumable(id: number, consumableDto: PatientConsumableDto, createdBy) {
        return null;
    }

    async deleteConsumable(id: number, username): Promise<PatientConsumable> {
        return null;
    }
}
