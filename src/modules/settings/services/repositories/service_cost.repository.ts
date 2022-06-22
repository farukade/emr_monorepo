import { EntityRepository, Repository } from 'typeorm';
import { ServiceCostDto } from '../dto/service_cost.dto';
import { ServiceCost } from '../../entities/service_cost.entity';

@EntityRepository(ServiceCost)
export class ServiceCostRepository extends Repository<ServiceCost> {
  async createCost(serviceCostDto: ServiceCostDto, service, hmo): Promise<ServiceCost> {
    const { tariff } = serviceCostDto;

    const cost = new ServiceCost();
    cost.item = service;
    cost.hmo = hmo;
    cost.tariff = tariff;
    await cost.save();
    return cost;
  }
}
