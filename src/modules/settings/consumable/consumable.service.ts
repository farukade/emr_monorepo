import { Injectable, NotFoundException, Delete } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { Raw } from 'typeorm';
import { ConsumableRepository } from './consumable.repository';
import { ConsumableDto } from './dto/consumable.dto';
import { Consumable } from '../entities/consumable.entity';

@Injectable()
export class ConsumableService {
    constructor(
        @InjectRepository(ConsumableRepository)
        private consumableRepository: ConsumableRepository,
    ) {

    }

    async getConsumables(options: PaginationOptionsInterface, params): Promise<any> {
        const { q, list } = params;

        if (list && list === 'all') {
            return await this.consumableRepository.find();
        }

        const page = options.page - 1;

        let result;
        let total = 0;
        if (q && q.length > 0) {
            [result, total] = await this.consumableRepository.findAndCount({
                where: { name: Raw(alias => `LOWER(${alias}) Like '%${q.toLowerCase()}%'`) },
                order: { name: 'ASC' },
                take: options.limit,
                skip: (page * options.limit),
            });
        } else {
            [result, total] = await this.consumableRepository.findAndCount({
                order: { name: 'ASC' },
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

    async saveConsumabe(createDto: ConsumableDto, createdBy): Promise<Consumable> {
        const { name, description } = createDto;

        const consumable = new Consumable();
        consumable.name = name;
        consumable.description = description;
        consumable.createdBy = createdBy;

        return await this.consumableRepository.save(consumable);
    }

    async updateConsumable(id, updateDto: ConsumableDto, updatedBy) {
        const { name, description } = updateDto;

        const consumable = await this.consumableRepository.findOne(id);
        consumable.name = name;
        consumable.description = description;
        consumable.lastChangedBy = updatedBy;
        await consumable.save();

        return consumable;
    }

    async deleteConsumable(id: number, username) {
        const consumable = await this.consumableRepository.findOne(id);

        if (!consumable) {
            throw new NotFoundException(`Consumable with ID '${id}' not found`);
        }

        consumable.deletedBy = username;
        await consumable.save();

        return consumable.softRemove();
    }
}
