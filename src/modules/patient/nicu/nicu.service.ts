import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NicuRepository } from './nicu.repository';
import { Nicu } from './entities/nicu.entity';
import { StaffRepository } from '../../hr/staff/staff.repository';
import { PatientRepository } from '../repositories/patient.repository';
import { CreateNicuDto } from './dto/create-nicu.dto';
import { UpdateNicuDto } from './dto/update-nicu.dto';

@Injectable()
export class NicuService {
    constructor(
        @InjectRepository(NicuRepository)
        private nicuRepository: (NicuRepository),
        @InjectRepository(StaffRepository)
        private staffRepository: StaffRepository,
        @InjectRepository(PatientRepository)
        private patientRepository: PatientRepository,
    ) {
    }

    async createNicu(createNicuDto: CreateNicuDto, userId): Promise<any> {

        const user = await this.staffRepository.findOne(userId);

        try {
            const data = await this.nicuRepository.create(createNicuDto);
            return { success: true, data };
        } catch (err) {
            return { success: false, message: err.message };
        }

    }

    async getAllNicu(): Promise<Nicu[]> {
        const nicu = await this.nicuRepository.find({});
        return nicu;
    }

    async getNicu(id: number): Promise<Nicu> {
        const nicu = await this.nicuRepository.findOne({ id });
        return nicu;
    }

    updateNicu(id: string, updateNicuDto: UpdateNicuDto): Promise<Nicu> {
        return;
    }

    removeNicu(id: string) {
        return `This action removes a #${id} nicu`;
    }
}
