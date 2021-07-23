import { Injectable } from '@nestjs/common';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { StoreInventoryRepository } from './store.repository';
import { Raw } from 'typeorm';

@Injectable()
export class StoreService {
    constructor(
        @InjectRepository(StoreInventoryRepository)
        private storeInventoryRepository: StoreInventoryRepository,
    ) {
    }

    async fetchAll(options: PaginationOptionsInterface, params): Promise<Pagination> {
        const { q } = params;

        const page = options.page - 1;

        let result;
        let total = 0;
        if (q && q.length > 0) {
            [result, total] = await this.storeInventoryRepository.findAndCount({
                where: {
                    name: Raw(alias => `LOWER(${alias}) Like '%${q.toLowerCase()}%'`),
                },
                relations: ['vendor'],
                order: { name: 'ASC' },
                take: options.limit,
                skip: (page * options.limit),
            });
        } else {
            [result, total] = await this.storeInventoryRepository.findAndCount({
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
