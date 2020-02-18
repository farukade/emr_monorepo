import { EntityRepository, Repository } from 'typeorm';
import { ServiceCategory } from '../entities/service_category.entity';
import { ServiceCategoryDto } from './dto/service.category.dto';

@EntityRepository(ServiceCategory)
export class ServiceCategoryRepository extends Repository<ServiceCategory> {

    async createCategory(serviceCategoryDto: ServiceCategoryDto): Promise<ServiceCategory> {
        const { name, notes }  = serviceCategoryDto;
        const category  = new ServiceCategory();
        category.name   = name;
        category.notes   = notes;
        await category.save();
        return category;
    }
}
