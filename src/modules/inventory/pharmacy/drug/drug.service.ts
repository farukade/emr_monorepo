import { Injectable } from '@nestjs/common';
import { PaginationOptionsInterface } from '../../../../common/paginate';
import { Pagination } from '../../../../common/paginate/paginate.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { DrugRepository } from './drug.repository';
import { Raw } from 'typeorm';
import { DrugBatchRepository } from '../batches/batches.repository';
import { DrugGenericRepository } from '../generic/generic.repository';
import { DrugDto } from '../../dto/drug.dto';
import { ManufacturerRepository } from '../../manufacturer/manufacturer.repository';

@Injectable()
export class DrugService {
    constructor(
        @InjectRepository(DrugRepository)
        private drugRepository: DrugRepository,
        @InjectRepository(DrugBatchRepository)
        private drugBatchRepository: DrugBatchRepository,
        @InjectRepository(DrugGenericRepository)
        private drugGenericRepository: DrugGenericRepository,
        @InjectRepository(ManufacturerRepository)
        private manufacturerRepository: ManufacturerRepository,
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
                where: { drug: item },
                order: { expirationDate: 'ASC' },
            });

            item.manufacturer = await this.manufacturerRepository.findOne(item.manufacturer_id);

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

    async update(id, drugDto: DrugDto): Promise<any> {
        try {
            const { name, generic_id, unitOfMeasure, manufacturer_id } = drugDto;

            const generic = await this.drugGenericRepository.findOne(generic_id);
            const manufacturer = await this.manufacturerRepository.findOne(manufacturer_id);

            const drug = await this.drugRepository.findOne(id);
            drug.name = name;
            drug.generic = generic;
            drug.unitOfMeasure = unitOfMeasure;
            drug.manufacturer = manufacturer;
            const rs = await drug.save();

            return { success: true, drug: rs };
        } catch (e) {
            return { success: false, message: 'error could not update drug' };
        }
    }
}
