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
import { ServiceRepository } from '../../../settings/services/repositories/service.repository';
import { Drug } from '../../entities/drug.entity';
import { ServiceCategoryRepository } from '../../../settings/services/repositories/service_category.repository';
import { formatPID } from '../../../../common/utils/utils';
import { ServiceCost } from '../../../settings/entities/service_cost.entity';
import { HmoSchemeRepository } from '../../../hmo/repositories/hmo_scheme.repository';

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
		@InjectRepository(ServiceRepository)
		private serviceRepository: ServiceRepository,
		@InjectRepository(ServiceCategoryRepository)
		private serviceCategoryRepository: ServiceCategoryRepository,
		@InjectRepository(HmoSchemeRepository)
		private hmoSchemeRepository: HmoSchemeRepository,
	) {}

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
				skip: page * options.limit,
			});
		} else {
			[result, total] = await this.drugRepository.findAndCount({
				where: { ...extra },
				order: { name: 'ASC' },
				take: options.limit,
				skip: page * options.limit,
			});
		}

		let rs = [];
		for (const item of result) {
			item.batches = await this.drugBatchRepository.find({
				where: { drug: item },
				order: { expirationDate: 'ASC' },
			});

			if (item.manufacturer_id) {
				item.manufacturer = await this.manufacturerRepository.findOne(item.manufacturer_id);
			}

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

	async create(drugDto: DrugDto, username: string): Promise<any> {
		try {
			const { name, generic_id, unitOfMeasure, manufacturer_id } = drugDto;

			const generic = await this.drugGenericRepository.findOne(generic_id);
			const manufacturer = manufacturer_id && manufacturer_id !== '' ? await this.manufacturerRepository.findOne(manufacturer_id) : null;

			const category = await this.serviceCategoryRepository.findOne({ where: { slug: 'drugs' } });

			const lastService = await this.serviceRepository.findOne({
				where: { category },
				order: { code: 'DESC' },
			});

			let alphaCode;
			let code;
			if (lastService) {
				alphaCode = lastService.code.substring(0, 2);
				const num = lastService.code.slice(2);
				const index = parseInt(num, 10) + 1;
				code = `${alphaCode.toLocaleUpperCase()}${formatPID(index, lastService.code.length - 2)}`;
			} else {
				const names = category.name.split(' ');
				alphaCode = names.length > 1 ? names.map(n => n.substring(0, 1)).join('') : category.name.substring(0, 2);
				code = `${alphaCode.toLocaleUpperCase()}${formatPID(1)}`;
			}

			const drug = new Drug();
			drug.name = name;
			drug.code = code;
			drug.generic = generic;
			drug.unitOfMeasure = unitOfMeasure;
			drug.manufacturer = manufacturer;
			drug.createdBy = username;
			const rs = await drug.save();

			const service = await this.serviceRepository.createService({ name }, category, code);

			const schemes = await this.hmoSchemeRepository.find();

			for (const scheme of schemes) {
				const serviceCost = new ServiceCost();
				serviceCost.code = service.code;
				serviceCost.item = service;
				serviceCost.hmo = scheme;
				serviceCost.tariff = 0;

				await serviceCost.save();
			}

			rs.batches = [];
			rs.manufacturer = manufacturer;

			return { success: true, drug: rs };
		} catch (e) {
			console.log(e);
			return { success: false, message: 'error could not add new drug' };
		}
	}

	async update(id, drugDto: DrugDto, username: string): Promise<any> {
		try {
			const { name, generic_id, unitOfMeasure, manufacturer_id } = drugDto;

			const generic = await this.drugGenericRepository.findOne(generic_id);
			const manufacturer = manufacturer_id && manufacturer_id !== '' ? await this.manufacturerRepository.findOne(manufacturer_id) : null;

			const drug = await this.drugRepository.findOne(id);
			drug.name = name;
			drug.generic = generic;
			drug.unitOfMeasure = unitOfMeasure;
			drug.manufacturer = manufacturer;
			drug.lastChangedBy = username;
			const rs = await drug.save();

			const service = await this.serviceRepository.findOne({
				where: { code: drug.code },
			});
			service.name = name;
			await service.save();

			return { success: true, drug: rs };
		} catch (e) {
			return { success: false, message: 'error could not update drug' };
		}
	}

	async getDrugsReport(options: PaginationOptionsInterface) {
		try {
			const page = options.page;

			const [batches, total] = await this.drugBatchRepository.findAndCount({
				order: { name: 'ASC' },
				take: options.limit,
				skip: page * options.limit,
			});

			let result = [];

			for (const batch of batches) {
				if (batch.drug && batch.drug.generic) {
					result = [...result, { quantity: batch.quantity, name: batch.drug.name, genericName: batch.drug.generic.name }];
				}
			}

			return {
				result,
				lastPage: Math.ceil(total / options.limit),
				itemsPerPage: options.limit,
				totalPages: total,
				currentPage: options.page,
			};
		} catch (error) {
			console.log(error);
		}
	}
}
