import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationOptionsInterface } from '../../../../common/paginate';
import { Pagination } from '../../../../common/paginate/paginate.interface';
import { DrugGenericRepository } from './generic.repository';
import { Raw } from 'typeorm';
import { DrugCategoryRepository } from '../drug/drug_category.repository';
import { DrugRepository } from '../drug/drug.repository';
import { DrugBatchRepository } from '../batches/batches.repository';
import { DrugGenericDto } from '../../dto/generic.dto';
import { DrugGeneric } from '../../entities/drug_generic.entity';

@Injectable()
export class DrugGenericService {
  constructor(
    @InjectRepository(DrugGenericRepository)
    private drugGenericRepository: DrugGenericRepository,
    @InjectRepository(DrugCategoryRepository)
    private drugCategoryRepository: DrugCategoryRepository,
    @InjectRepository(DrugRepository)
    private drugRepository: DrugRepository,
    @InjectRepository(DrugBatchRepository)
    private drugBatchRepository: DrugBatchRepository,
  ) {}

  async fetchAll(options: PaginationOptionsInterface, params): Promise<Pagination> {
    const { q } = params;

    const page = options.page - 1;

    let where = {};

    if (q && q !== '') {
      where = { ...where, name: Raw((alias) => `LOWER(${alias}) Like '%${q.toLowerCase()}%'`) };
    }

    const [result, total] = await this.drugGenericRepository.findAndCount({
      where,
      relations: ['category'],
      order: { name: 'ASC' },
      take: options.limit,
      skip: page * options.limit,
    });

    let generics = [];
    for (const item of result) {
      const drugs = await this.drugRepository.find({
        where: { generic: item },
        relations: ['generic', 'manufacturer'],
      });

      let rs = [];
      for (const drug of drugs) {
        const batches = await this.drugBatchRepository.find({
          where: { drug },
          order: { expirationDate: 'ASC' },
        });

        rs = [...rs, { ...drug, batches }];
      }

      generics = [...generics, { ...item, drugs: rs }];
    }

    return {
      result: generics,
      lastPage: Math.ceil(total / options.limit),
      itemsPerPage: options.limit,
      totalPages: total,
      currentPage: options.page,
    };
  }

  async find(id: number): Promise<any> {
    const generic = await this.drugGenericRepository.findOne(id);

    const drugs = await this.drugRepository.find({
      where: { generic },
      relations: ['generic', 'manufacturer', 'batches'],
    });

    return { ...generic, drugs };
  }

  async create(genericDto: DrugGenericDto, username: string): Promise<any> {
    try {
      const { name } = genericDto;

      const drug = new DrugGeneric();
      drug.name = name;
      drug.lastChangedBy = username;
      const rs = await drug.save();

      return { success: true, generic: rs };
    } catch (e) {
      return { success: false, message: 'error could not add new generic name' };
    }
  }
}
