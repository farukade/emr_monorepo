import { EntityRepository, Repository } from 'typeorm';
import { ServiceCategory } from '../../entities/service_category.entity';
import { ServiceCategoryDto } from '../dto/service.category.dto';
import { slugify } from '../../../../common/utils/utils';

@EntityRepository(ServiceCategory)
export class ServiceCategoryRepository extends Repository<ServiceCategory> {

    async createCategory(serviceCategoryDto: ServiceCategoryDto): Promise<ServiceCategory> {
        const { name }  = serviceCategoryDto;
        const category  = new ServiceCategory();
        category.name   = name;
        category.slug   = slugify(name);
        await category.save();
        return category;
    }
}
