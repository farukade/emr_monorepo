import { Injectable, NotFoundException, Delete } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { Raw } from 'typeorm';
import { NicuAccommodationRepository } from './accommodation.repository';
import { AccommodationDto } from './dto/accommodation.dto';
import { NicuAccommodation } from '../entities/nicu-accommodation.entity';
import { slugify } from '../../../common/utils/utils';

@Injectable()
export class NicuAccommodationService {
  constructor(
    @InjectRepository(NicuAccommodationRepository)
    private nicuAccommodationRepository: NicuAccommodationRepository,
  ) {}

  async getAccommodations(options: PaginationOptionsInterface, params): Promise<any> {
    const { q, list } = params;

    if (list && list === 'all') {
      return await this.nicuAccommodationRepository.find();
    }

    const page = options.page - 1;

    let result;
    let total = 0;
    if (q && q.length > 0) {
      [result, total] = await this.nicuAccommodationRepository.findAndCount({
        where: { name: Raw((alias) => `LOWER(${alias}) Like '%${q.toLowerCase()}%'`) },
        order: { name: 'ASC' },
        take: options.limit,
        skip: page * options.limit,
      });
    } else {
      [result, total] = await this.nicuAccommodationRepository.findAndCount({
        order: { name: 'ASC' },
        take: options.limit,
        skip: page * options.limit,
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

  async saveAccommodation(createDto: AccommodationDto, createdBy): Promise<NicuAccommodation> {
    const { name, description, amount, quantity } = createDto;

    const accommodation = new NicuAccommodation();
    accommodation.name = name;
    accommodation.slug = slugify(name);
    accommodation.description = description;
    accommodation.amount = amount;
    accommodation.quantity = quantity;
    accommodation.quantity_unused = quantity;
    accommodation.createdBy = createdBy;

    return await this.nicuAccommodationRepository.save(accommodation);
  }

  async updateAccommodation(id, updateDto: AccommodationDto, updatedBy) {
    const { name, description, amount, quantity } = updateDto;

    const accommodation = await this.nicuAccommodationRepository.findOne(id);

    let quantity_unused = accommodation.quantity_unused;
    if (accommodation.quantity > quantity) {
      quantity_unused = accommodation.quantity_unused - (accommodation.quantity - quantity);
    } else if (quantity > accommodation.quantity) {
      quantity_unused = accommodation.quantity_unused + (quantity - accommodation.quantity);
    }

    accommodation.name = name;
    accommodation.slug = slugify(name);
    accommodation.description = description;
    accommodation.amount = amount;
    accommodation.quantity = quantity;
    accommodation.quantity_unused = quantity_unused;
    accommodation.lastChangedBy = updatedBy;
    await accommodation.save();

    return accommodation;
  }

  async deleteAccommodation(id: number, username) {
    const accommodation = await this.nicuAccommodationRepository.findOne(id);

    if (!accommodation) {
      throw new NotFoundException(`Accommodation with ID '${id}' not found`);
    }

    accommodation.deletedBy = username;
    await accommodation.save();

    return accommodation.softRemove();
  }
}
