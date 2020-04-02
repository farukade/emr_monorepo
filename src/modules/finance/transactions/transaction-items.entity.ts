import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Transactions } from './transaction.entity';
import { CafeteriaItem } from '../../inventory/cafeteria/entities/cafeteria_item.entity';

@Entity({ name: 'transaction_items'})
export class TransactionItems extends CustomBaseEntity {

    @ManyToOne(
        () => Transactions,
        transaction => transaction.items,
    )
    @JoinColumn({name: 'transaction_id'})
    transaction!: Transactions;

    @ManyToOne(
        () => CafeteriaItem,
        { eager: true },
    )
    item!: CafeteriaItem;

    @Column({type: 'float4', nullable: true})
    amount: number;
}
