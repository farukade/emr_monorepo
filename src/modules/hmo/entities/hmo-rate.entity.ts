import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Stock } from '../../inventory/entities/stock.entity';
import { Hmo } from './hmo.entity';
import { Service } from '../../settings/entities/service.entity';

@Entity({ name: 'hmo_rates' })
export class HmoRate extends CustomBaseEntity {

  @ManyToOne(type => Hmo)
  @JoinColumn({ name: 'hmo_id' })
  public hom!: Hmo;

  @ManyToOne(type => Stock, {nullable: true})
  @JoinColumn({ name: 'stock_id' })
  public stock: Stock;

  @ManyToOne(type => Service, {nullable: true})
  @JoinColumn({ name: 'service_id' })
  public service: Service;

  @Column({ type: 'varchar', nullable: true})
  rate: string;

  @Column({ type: 'varchar', nullable: true })
  percentage: string;

  @Column({ type: 'varchar', nullable: true })
  comment: string;
}
