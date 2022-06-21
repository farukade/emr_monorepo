import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { ManufacturerRepository } from './manufacturer.repository';
import { ManufacturerDto } from '../dto/manufacturer.dto';

@Injectable()
export class ManufacturerService {
  constructor(
    @InjectRepository(ManufacturerRepository)
    private manufacturerRepository: ManufacturerRepository,
  ) {}

  async fetchAll(options: PaginationOptionsInterface, q: string): Promise<Pagination> {
    const page = options.page - 1;

    const [result, count] = await this.manufacturerRepository.findAndCount({
      take: options.limit,
      skip: page * options.limit,
    });

    return {
      result,
      lastPage: Math.ceil(count / options.limit),
      itemsPerPage: options.limit,
      totalPages: count,
      currentPage: options.page,
    };
  }

  async create(manufacturerDto: ManufacturerDto): Promise<any> {
    try {
      const manufacturer = await this.manufacturerRepository.saveManufacturer(manufacturerDto);

      return { success: true, manufacturer };
    } catch (e) {
      return { success: false, message: 'error could not create manufacturer' };
    }
  }

  async update(id: string, manufacturerDto: ManufacturerDto): Promise<any> {
    try {
      const { name } = manufacturerDto;

      const manufacturer = await this.manufacturerRepository.findOne(id);
      manufacturer.name = name;

      await manufacturer.save();

      return { success: true, manufacturer };
    } catch (e) {
      return { success: false, message: 'error could not save manufacturer' };
    }
  }

  async delete(id: number, username): Promise<any> {
    try {
      const manufacturer = await this.manufacturerRepository.findOne(id);

      if (!manufacturer) {
        throw new NotFoundException(`Manufacturer with ID '${id}' not found`);
      }

      manufacturer.deletedBy = username;
      await manufacturer.save();

      const rs = await manufacturer.softRemove();

      return { success: true, manufacturer: rs };
    } catch (e) {
      return { success: false, message: 'error could not delete manufacturer' };
    }
  }
}
