import { Column, Entity } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';

@Entity({ name: 'specializations' })
export class Specialization extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 300, unique: true })
  name: string;
}
