import { EntityRepository, Repository } from 'typeorm';
import { LeaveCategoryDto } from './dto/leave.category.dto';
import { LeaveCategory } from '../entities/leave.category.entity';

@EntityRepository(LeaveCategory)
export class LeaveCategoryRepository extends Repository<LeaveCategory> {

    async saveCategory(leaveCategoryDto: LeaveCategoryDto): Promise<LeaveCategory> {
        const { name } = leaveCategoryDto;
        const category = new LeaveCategory();
        category.name = name;
        await category.save();
        return category;
    }
}
