import { Type } from 'class-transformer';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Country } from './country.entity';

@Entity({ name: 'banks' })
export class Bank extends BaseEntity {
  @PrimaryColumn()
  id: number;

  @Column({ type: 'varchar', length: 300 })
  name: string;
}
