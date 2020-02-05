import { Type } from 'class-transformer';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';

@Entity({ name: 'parameters' })
export class Parameter extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 300, unique: true })
  name: string;

}
