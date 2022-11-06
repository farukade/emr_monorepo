import { EntityRepository, Repository } from 'typeorm';
import { IvfHcgAdministrationChartEntity } from '../entities/ivf_hcg_administration_chart.entity';

@EntityRepository(IvfHcgAdministrationChartEntity)
export class IvfHcgRepository extends Repository<IvfHcgAdministrationChartEntity> {}
