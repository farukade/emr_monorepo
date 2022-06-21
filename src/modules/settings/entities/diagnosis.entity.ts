import { Column, Entity } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';

@Entity({ name: 'diagnosis' })
export class Diagnosis extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 300, nullable: true })
  code: string;

  @Column({ type: 'varchar', default: 10 })
  type: string;

  @Column({ type: 'varchar', length: 300 })
  description: string;
}
