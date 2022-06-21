import { EntityRepository, Repository } from 'typeorm';
import { Vendor } from '../entities/vendor.entity';
import { VendorDto } from '../dto/vendor.dto';

@EntityRepository(Vendor)
export class VendorRepository extends Repository<Vendor> {
  async saveVendor(vendorDto: VendorDto): Promise<Vendor> {
    const { name } = vendorDto;
    const vendor = new Vendor();
    vendor.name = name;
    await vendor.save();
    return vendor;
  }
}
