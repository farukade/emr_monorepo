import { Type } from 'class-transformer';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { CustomBaseEntity } from '../../common/entities/custom-base.entity';
import { Stock } from '../inventory/entities/stock.entity';

@Entity({ name: 'hmos' })
export class Hmo extends CustomBaseEntity {

  @ManyToOne(type => Stock)
  @JoinColumn({ name: 'stock_id' })
  public stock!: Stock;

  @Column({ type: 'varchar'})
  rate: string;

  @Column({ type: 'varchar' })
  percentage: string;
}
