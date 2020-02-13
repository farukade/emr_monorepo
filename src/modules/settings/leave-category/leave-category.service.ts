import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LeaveCategoryRepository } from './leave.category.repository';
import { LeaveCategory } from '../entities/leave.category.entity';
import { LeaveCategoryDto } from './dto/leave.category.dto';

@Injectable()
export class LeaveCategoryService {
    constructor(
        @InjectRepository(LeaveCategoryRepository)
        private leaveCategoryRepository: LeaveCategoryRepository,
    ) {}

    async getCategories(): Promise<LeaveCategory[]> {
        return this.leaveCategoryRepository.find();
    }

    async createCategory(leaveCategoryDto: LeaveCategoryDto): Promise<LeaveCategory> {
        return this.leaveCategoryRepository.saveCategory(leaveCategoryDto);
    }

    async updateCategory(id: string, leaveCategoryDto: LeaveCategoryDto): Promise<LeaveCategory> {
        const { name, duration } = leaveCategoryDto;
        const category = await this.leaveCategoryRepository.findOne(id);
        category.name = name;
        category.duration = duration;
        await category.save();
        return category;
    }

    async deleteCategory(id: string): Promise<void> {
        const result = await this.leaveCategoryRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Lab test category with ID '${id}' not found`);
        }
    }
}
