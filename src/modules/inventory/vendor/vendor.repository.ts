import { EntityRepository, Repository } from 'typeorm';
import { Vendor } from './vendor.entity';
import { Stock } from '../entities/stock.entity';
import { VendorDto } from './vendor.dto';

@EntityRepository(Vendor)
export class VendorRepository extends Repository<Vendor> {
    async saveVendor(vendorDto: VendorDto): Promise<Vendor> {
        const { name } = vendorDto;
        const vendor       = new Vendor();
        vendor.name        = name;
        await vendor.save();
        return vendor;
    }
}
