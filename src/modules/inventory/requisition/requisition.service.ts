import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RequisitionRepository } from './requisition.repository';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { Raw } from 'typeorm';
import { Pagination } from '../../../common/paginate/paginate.interface';

@Injectable()
export class RequisitionService {
    constructor(
        @InjectRepository(RequisitionRepository)
        private requisitionRepository: RequisitionRepository,
    ) {
    }

    async fetchRequisitions(options: PaginationOptionsInterface, q: string): Promise<Pagination> {
        const page = options.page - 1;

        let result;
        let count;
        if (q && q !== '') {
            result = await this.requisitionRepository.find({
                where: [
                    { name: Raw(alias => `LOWER(${alias}) Like '%${q.toLowerCase()}%'`) },
                ],
                relations: ['item'],
                take: options.limit,
                skip: (page * options.limit),
            });

            count = await this.requisitionRepository.count({
                where: { name: Raw(alias => `LOWER(${alias}) Like '%${q.toLowerCase()}%'`) },
            });
        } else {
            result = await this.requisitionRepository.find({
                take: options.limit,
                skip: (page * options.limit),
            });

            count = await this.requisitionRepository.count();
        }

        return {
            result,
            lastPage: Math.ceil(count / options.limit),
            itemsPerPage: options.limit,
            totalPages: count,
            currentPage: options.page,
        };
    }
}
