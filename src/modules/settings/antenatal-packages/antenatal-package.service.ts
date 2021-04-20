import { Injectable, NotFoundException, Delete } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pagination, PaginationOptionsInterface } from '../../../common/paginate';
import { AntenatalPackage } from '../entities/antenatal-package.entity';
import { AntenatalPackageRepository } from './antenatal-package.repository';
import { AntenatalPackageDto } from './dto/antenatal-package.dto';
import { Raw } from 'typeorm';

@Injectable()
export class AntenatalPackageService {
    constructor(
        @InjectRepository(AntenatalPackageRepository)
        private antenatalPackageRepository: AntenatalPackageRepository,
    ) {

    }

    async getPackages(options: PaginationOptionsInterface, params): Promise<any> {
        const { q } = params;

        const page = options.page - 1;

        let result;
        let total = 0;
        if (q && q.length > 0) {
            [result, total] = await this.antenatalPackageRepository.findAndCount({
                where: { name: Raw(alias => `LOWER(${alias}) Like '%${q.toLowerCase()}%'`) },
                order: { name: 'ASC' },
                take: options.limit,
                skip: (page * options.limit),
            });
        } else {
            [result, total] = await this.antenatalPackageRepository.findAndCount({
                relations: ['category', 'hmo'],
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

    async savePackage(createDto: AntenatalPackageDto, createdBy): Promise<AntenatalPackage> {
        const { name, amount, description } = createDto;

        const antePackage = new AntenatalPackage();
        antePackage.name = name;
        antePackage.description = description;
        antePackage.amount = amount;
        antePackage.createdBy = createdBy;

        return await this.antenatalPackageRepository.save(antePackage);
    }

    async updatePackage(id, updateDto: AntenatalPackageDto, updatedBy) {
        const { name, amount, description } = updateDto;

        const antenatalPackage = await this.antenatalPackageRepository.findOne(id);
        antenatalPackage.name = name;
        antenatalPackage.description = description;
        antenatalPackage.amount = amount;
        antenatalPackage.lastChangedBy = updatedBy;
        await antenatalPackage.save();

        return antenatalPackage;
    }

    async deletePackage(id: number, username) {
        const antePackage = await this.antenatalPackageRepository.findOne(id);

        if (!antePackage) {
            throw new NotFoundException(`Antenatal package with ID '${id}' not found`);
        }

        antePackage.deletedBy = username;
        await antePackage.save();

        return antePackage.softRemove();
    }
}
