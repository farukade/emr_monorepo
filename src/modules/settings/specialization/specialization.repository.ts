import { EntityRepository, Repository } from 'typeorm';
import { SpecializationDto } from './dto/specialization.dto';
import { Specialization } from '../entities/specialization.entity';

@EntityRepository(Specialization)
export class SpecializationRepository extends Repository<Specialization> {

    async savespecialization(specializationDto: SpecializationDto): Promise<Specialization> {
        const { name }  = specializationDto;
        const specialization  = new Specialization();
        specialization.name   = name;
        await specialization.save();
        return specialization;
    }
}
