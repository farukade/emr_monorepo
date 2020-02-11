import { EntityRepository, Repository } from 'typeorm';
import { ServiceSubCategory } from '../entities/service_sub_category.entity';
import { ServiceSubCategoryDto } from './dto/service.sub.category.dto';
import { ServiceCategory } from '../entities/service_category.entity';

@EntityRepository(ServiceSubCategory)
export class ServiceSubCategoryRepository extends Repository<ServiceSubCategory> {

     async saveCategory(serviceSubCategoryDto: ServiceSubCategoryDto, category: ServiceCategory): Promise<ServiceSubCategory> {
        const { name } = serviceSubCategoryDto;
        const subCategory = new ServiceSubCategory();
        subCategory.name = name;
        subCategory.category = category;
        await subCategory.save();
        return subCategory;
    }
}
