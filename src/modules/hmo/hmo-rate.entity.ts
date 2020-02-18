import { Type } from 'class-transformer';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { CustomBaseEntity } from '../../common/entities/custom-base.entity';
import { Stock } from '../inventory/entities/stock.entity';
import { Hmo } from './hmo.entity';

@Entity({ name: 'hmo_rates' })
export class HmoRate extends CustomBaseEntity {

  @ManyToOne(type => Hmo)
  @JoinColumn({ name: 'hmo_id' })
  public hom!: Hmo;

  @ManyToOne(type => Stock)
  @JoinColumn({ name: 'stock_id' })
  public stock!: Stock;

  @Column({ type: 'varchar'})
  rate: string;

  @Column({ type: 'varchar' })
  percentage: string;
}
