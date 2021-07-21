import { Injectable } from '@nestjs/common';
import { PaginationOptionsInterface } from '../../../../common/paginate';
import { Pagination } from '../../../../common/paginate/paginate.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { DrugRepository } from './drug.repository';
import { Raw } from 'typeorm';
import * as moment from 'moment';
import { DrugBatchRepository } from '../batches/batches.repository';
import { DrugGenericRepository } from '../generic/generic.repository';

@Injectable()
export class DrugService {
    constructor(
        @InjectRepository(DrugRepository)
        private drugRepository: DrugRepository,
        @InjectRepository(DrugBatchRepository)
        private drugBatchRepository: DrugBatchRepository,
        @InjectRepository(DrugGenericRepository)
        private drugGenericRepository: DrugGenericRepository,
    ) {
    }

    async fetchAll(options: PaginationOptionsInterface, params): Promise<Pagination> {
        const { q, generic_id } = params;

        const page = options.page - 1;

        let extra;
        if (generic_id && generic_id !== '') {
            const generic = await this.drugGenericRepository.findOne(generic_id);
            extra = { generic };
        }

        let result;
        let total = 0;
        if (q && q.length > 0) {
            [result, total] = await this.drugRepository.findAndCount({
                where: {
                    name: Raw(alias => `LOWER(${alias}) Like '%${q.toLowerCase()}%'`),
                    ...extra,
                },
                order: { name: 'ASC' },
                take: options.limit,
                skip: (page * options.limit),
            });
        } else {
            [result, total] = await this.drugRepository.findAndCount({
                where: { ...extra },
                order: { name: 'ASC' },
                take: options.limit,
                skip: (page * options.limit),
            });
        }

        let rs = [];
        for (const item of result) {
            item.batches = await this.drugBatchRepository.find({
                where: {
                    expirationDate: Raw(alias => `DATE(${alias}) > :date`, {
                        date: moment().format('YYYY-MM-DD'),
                    }),
                    drug: item,
                },
                order: { expirationDate: 'ASC' },
            });

            rs = [...rs, item];
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
