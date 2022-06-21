import { EntityRepository, Repository } from 'typeorm';
import { Requisition } from '../entities/requisition.entity';

@EntityRepository(Requisition)
export class RequisitionRepository extends Repository<Requisition> {}
