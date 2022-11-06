import { Type } from 'class-transformer';
import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { State } from './state.entity';

@Entity({ name: 'countries' })
export class Country extends BaseEntity {
  @PrimaryColumn()
  id: number;

  @Column({ type: 'varchar', length: 300 })
  name: string;

  @OneToMany(() => State, (state) => state.country, { eager: true, onDelete: 'CASCADE' })
  @Type(() => State)
  states?: State[];
}
