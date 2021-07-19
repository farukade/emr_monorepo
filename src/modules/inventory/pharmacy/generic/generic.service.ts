import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationOptionsInterface } from '../../../../common/paginate';
import { Pagination } from '../../../../common/paginate/paginate.interface';
import { DrugGenericRepository } from './generic.repository';

@Injectable()
export class DrugGenericService {
    constructor(
        @InjectRepository(DrugGenericRepository)
        private drugGenericRepository: DrugGenericRepository,
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
