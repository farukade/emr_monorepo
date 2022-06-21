import { EntityRepository, Repository } from 'typeorm';
import { DrugManufacturer } from '../entities/drug_manufacturers.entity';
import { ManufacturerDto } from '../dto/manufacturer.dto';

@EntityRepository(DrugManufacturer)
export class ManufacturerRepository extends Repository<DrugManufacturer> {
  async saveManufacturer(manufacturerDto: ManufacturerDto): Promise<DrugManufacturer> {
    const { name } = manufacturerDto;
    const manufacturer = new DrugManufacturer();
    manufacturer.name = name;
    await manufacturer.save();

    return manufacturer;
  }
}
