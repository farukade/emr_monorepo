import { EntityRepository, Repository } from 'typeorm';
import { Service } from '../../entities/service.entity';
import { ServiceDto } from '../dto/service.dto';
import { ServiceCategory } from '../../entities/service_category.entity';
import { formatPID } from '../../../../common/utils/utils';

@EntityRepository(Service)
export class ServiceRepository extends Repository<Service> {

    async createService(serviceDto, category: ServiceCategory, code: string): Promise<Service> {
        const { name } = serviceDto;

        const service = new Service();
        service.name = name;
        service.code = code;
        service.category = category;
        await service.save();
        return service;
    }
}
