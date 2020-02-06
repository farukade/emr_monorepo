import { Type } from 'class-transformer';
import { Column, Entity, OneToMany } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';

@Entity({ name: 'leave_categories' })
export class LeaveCategory extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 300, unique: true })
  name: string;
}
