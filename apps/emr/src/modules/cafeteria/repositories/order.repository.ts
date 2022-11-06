import { EntityRepository, Repository } from 'typeorm';
import { CafeteriaOrder } from '../entities/order.entity';

@EntityRepository(CafeteriaOrder)
export class OrderRepository extends Repository<CafeteriaOrder> {}
