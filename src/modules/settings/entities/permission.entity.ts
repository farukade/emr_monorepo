import { Column, Entity } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';

@Entity({ name: 'permissions' })
export class Permission extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 300 })
  name: string;
}
