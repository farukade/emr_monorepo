import { EntityRepository, Repository } from 'typeorm';
import { LabTestCategory } from '../../entities/lab_test_category.entity';
import { LabCategoryDto } from '../dto/lab.category.dto';

@EntityRepository(LabTestCategory)
export class LabTestCategoryRepository extends Repository<LabTestCategory> {
  async saveCategory(labCategoryDto: LabCategoryDto, createdBy: string): Promise<LabTestCategory> {
    const { name, duration } = labCategoryDto;
    const category = new LabTestCategory();
    category.name = name;
    category.duration = duration;
    category.createdBy = createdBy;
    await category.save();
    return category;
  }
}
