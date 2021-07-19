import { Injectable } from '@nestjs/common';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { RequisitionRepository } from './requisition.repository';

@Injectable()
export class RequisitionService {
    constructor(
        @InjectRepository(RequisitionRepository)
        private storeInventoryRepository: RequisitionRepository,
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
