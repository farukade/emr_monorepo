import { Type } from 'class-transformer';
import { Column, Entity } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';

@Entity({ name: 'departments' })
export class Bank extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 300, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 300, unique: true })
  description: string;
}
