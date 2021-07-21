import { Injectable } from '@nestjs/common';
import { PaginationOptionsInterface } from '../../../../common/paginate';
import { Pagination } from '../../../../common/paginate/paginate.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { DrugBatchRepository } from './batches.repository';
import { Raw } from 'typeorm';

@Injectable()
export class DrugBatchService {
    constructor(
        @InjectRepository(DrugBatchRepository)
        private drugBatchRepository: DrugBatchRepository,
    ) {
    }

    async fetchAll(options: PaginationOptionsInterface, params): Promise<Pagination> {
        const { q } = params;

        const page = options.page - 1;

        let result;
        let total = 0;
        if (q && q.length > 0) {
            [result, total] = await this.drugBatchRepository.findAndCount({
                where: {
                    name: Raw(alias => `LOWER(${alias}) Like '%${q.toLowerCase()}%'`),
                },
                relations: ['vendor'],
                order: { name: 'ASC' },
                take: options.limit,
                skip: (page * options.limit),
            });
        } else {
            [result, total] = await this.drugBatchRepository.findAndCount({
                relations: ['vendor'],
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
