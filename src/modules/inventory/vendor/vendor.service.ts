import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VendorRepository } from './vendor.repository';
import { Vendor } from './vendor.entity';
import { VendorDto } from './vendor.dto';

@Injectable()
export class VendorService {
    constructor(
        @InjectRepository(VendorRepository)
        private vendorRepository: VendorRepository,
    ) {}

    async getAll(): Promise<Vendor[]> {
        return await this.vendorRepository.find();
    }

    async create(vendorDto: VendorDto): Promise<Vendor> {
        return this.vendorRepository.saveVendor(vendorDto);
    }

    async update(id: string, vendorDto: VendorDto): Promise<Vendor> {
        const { name } = vendorDto;
        const vendor = await this.vendorRepository.findOne(id);
        vendor.name = name;
        await vendor.save();
        return vendor;
    }

    async delete(id: number, username): Promise<any> {
        const vendor = await this.vendorRepository.findOne(id);

        if (!vendor) {
            throw new NotFoundException(`Vendor with ID '${id}' not found`);
        }

        vendor.deletedBy = username;
        await vendor.save();

        return vendor.softRemove();
    }
}
