import { EntityRepository, Repository } from 'typeorm';
import { Service } from '../entities/service.entity';
import { ServiceDto } from './dto/service.dto';
import { ServiceSubCategory } from '../entities/service_sub_category.entity';
import { ServiceCategory } from '../entities/service_category.entity';
import { Hmo } from '../../hmo/entities/hmo.entity'

@EntityRepository(Service)
export class ServiceRepository extends Repository<Service> {

    async createService(serviceDto: ServiceDto, category: ServiceCategory, subCategory: ServiceSubCategory, hmo: Hmo ): Promise<Service> {
        const { name, tariff, hmo_tariff } = serviceDto;
        const service = new Service();
        service.name = name;
        service.tariff = tariff;
        service.hmo = hmo;
        service.hmoTarrif = hmo_tariff;
        service.category = category;
        service.subCategory = subCategory;
        await service.save();
        return service;
    }
}
