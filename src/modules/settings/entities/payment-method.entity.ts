import { Entity, Column } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';

@Entity({ name: 'payment_methods' })
export class PaymentMethod extends CustomBaseEntity {
  @Column()
  name: string;

  @Column()
  slug: string;

  @Column({ type: 'smallint', default: 1 })
  status: number;
}
