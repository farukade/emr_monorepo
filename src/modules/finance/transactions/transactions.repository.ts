import { Repository, EntityRepository } from 'typeorm';
import { Transactions } from './transaction.entity';

@EntityRepository(Transactions)
export class TransactionsRepository extends Repository<Transactions> {

}