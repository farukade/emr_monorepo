import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationOptionsInterface } from '../../../../common/paginate';
import { Pagination } from '../../../../common/paginate/paginate.interface';
import { DrugGenericRepository } from './generic.repository';
import { Raw } from 'typeorm';
import { DrugCategoryRepository } from '../drug/drug_category.repository';

@Injectable()
export class DrugGenericService {
    constructor(
        @InjectRepository(DrugGenericRepository)
        private drugGenericRepository: DrugGenericRepository,
        @InjectRepository(DrugCategoryRepository)
        private drugCategoryRepository: DrugCategoryRepository,
    ) {
    }

    async fetchAll(options: PaginationOptionsInterface, params): Promise<Pagination> {
        const { q } = params;

        const page = options.page - 1;

        let result;
        let total = 0;
        if (q && q.length > 0) {
            [result, total] = await this.drugGenericRepository.findAndCount({
                where: { name: Raw(alias => `LOWER(${alias}) Like '%${q.toLowerCase()}%'`) },
                relations: ['category', 'drugs'],
                order: { name: 'ASC' },
                take: options.limit,
                skip: (page * options.limit),
            });
        } else {
            [result, total] = await this.drugGenericRepository.findAndCount({
                relations: ['category', 'drugs'],
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
}
