import { EntityRepository, Repository } from 'typeorm';
import { Specimen } from '../../entities/specimen.entity';
import { SpecimenDto } from '../dto/specimen.dto';

@EntityRepository(Specimen)
export class SpecimenRepository extends Repository<Specimen> {
  async saveSpecimen(specimenDto: SpecimenDto, createdBy: string): Promise<Specimen> {
    const { name } = specimenDto;
    const specimen = new Specimen();
    specimen.name = name;
    specimen.createdBy = createdBy;
    await specimen.save();
    return specimen;
  }
}
