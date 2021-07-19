import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VendorRepository } from './vendor.repository';
import { Vendor } from '../entities/vendor.entity';
import { VendorDto } from '../dto/vendor.dto';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { Pagination } from '../../../common/paginate/paginate.interface';

@Injectable()
export class VendorService {
    constructor(
        @InjectRepository(VendorRepository)
        private vendorRepository: VendorRepository,
    ) {
    }

    async fetchAll(options: PaginationOptionsInterface, q: string): Promise<Pagination> {
        const page = options.page - 1;

        const [result, count] = await this.vendorRepository.findAndCount({
            take: options.limit,
            skip: (page * options.limit),
        });

        return {
            result,
            lastPage: Math.ceil(count / options.limit),
            itemsPerPage: options.limit,
            totalPages: count,
            currentPage: options.page,
        };
    }

    async create(vendorDto: VendorDto): Promise<any> {
        try {
            const vendor = await this.vendorRepository.saveVendor(vendorDto);

            return { success: true, vendor };
        } catch (e) {
            return { success: false, message: 'error could not create vendor' };
        }
    }

    async update(id: string, vendorDto: VendorDto): Promise<any> {
        try {
            const { name } = vendorDto;

            const vendor = await this.vendorRepository.findOne(id);
            vendor.name = name;

            await vendor.save();

            return { success: true, vendor };
        } catch (e) {
            return { success: false, message: 'error could not save vendor' };
        }
    }

    async delete(id: number, username): Promise<any> {
        try {
            const vendor = await this.vendorRepository.findOne(id);

            if (!vendor) {
                throw new NotFoundException(`Vendor with ID '${id}' not found`);
            }

            vendor.deletedBy = username;
            await vendor.save();

            const rs = await vendor.softRemove();

            return { success: true, vendor: rs };
        } catch (e) {
            return { success: false, message: 'error could not delete vendor' };
        }
    }
}
