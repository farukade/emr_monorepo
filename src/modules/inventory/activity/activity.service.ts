import { Injectable } from '@nestjs/common';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { InventoryActivityRepository } from './activity.repository';

@Injectable()
export class InventoryActivityService {
    constructor(
        @InjectRepository(InventoryActivityRepository)
        private inventoryActivityRepository: InventoryActivityRepository,
    ) {
    }

    async fetchAll(options: PaginationOptionsInterface, params): Promise<Pagination> {
        const page = options.page - 1;

        const [result, total] = await this.inventoryActivityRepository.findAndCount({
            relations: ['batch', 'store', 'cafeteria'],
            take: options.limit,
            skip: (page * options.limit),
        });

        return {
            result,
            lastPage: Math.ceil(total / options.limit),
            itemsPerPage: options.limit,
            totalPages: total,
            currentPage: options.page,
        };
    }
}
