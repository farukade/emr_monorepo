import { Column, Entity } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';

@Entity({ name: 'hmo_types' })
export class HmoType extends CustomBaseEntity {
  @Column({ type: 'varchar' })
  name: string;
}
