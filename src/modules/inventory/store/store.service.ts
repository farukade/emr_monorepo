import { Injectable } from '@nestjs/common';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { StoreInventoryRepository } from './store.repository';

@Injectable()
export class StoreService {
    constructor(
        @InjectRepository(StoreInventoryRepository)
        private storeInventoryRepository: StoreInventoryRepository,
    ) {
    }

    async fetchAll(options: PaginationOptionsInterface, q: string): Promise<Pagination> {
        const page = options.page - 1;
        const count = 0;

        return {
            result: [],
            lastPage: Math.ceil(count / options.limit),
            itemsPerPage: options.limit,
            totalPages: count,
            currentPage: options.page,
        };
    }
}
