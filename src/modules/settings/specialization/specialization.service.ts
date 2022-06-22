import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SpecializationRepository } from './specialization.repository';
import { SpecializationDto } from './dto/specialization.dto';
import { Specialization } from '../entities/specialization.entity';

@Injectable()
export class SpecializationService {
  constructor(
    @InjectRepository(SpecializationRepository)
    private specializationRepository: SpecializationRepository,
  ) {}

  async getSpecializations(): Promise<Specialization[]> {
    return this.specializationRepository.find();
  }

  async createSpecialization(specializationDto: SpecializationDto): Promise<Specialization> {
    return this.specializationRepository.savespecialization(specializationDto);
  }

  async updateSpecialization(id: string, specializationDto: SpecializationDto): Promise<Specialization> {
    const { name } = specializationDto;
    const specialization = await this.specializationRepository.findOne(id);
    specialization.name = name;
    await specialization.save();
    return specialization;
  }

  async deleteSpecialization(id: number): Promise<any> {
    const result = await this.specializationRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Specialization with ID '${id}' not found`);
    }

    const specialization = new Specialization();
    specialization.id = id;
    return specialization;
  }
}
