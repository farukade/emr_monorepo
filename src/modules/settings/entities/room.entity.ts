import { Type } from 'class-transformer';
import { Column, Entity, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { RoomCategory } from './room_category.entity';

@Entity({ name: 'rooms' })
export class Room extends CustomBaseEntity {

  @Column({ type: 'varchar', length: 300 })
  name: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  floor: string;

  @Column({ type: 'varchar', nullable: true })
  status: string;

  @ManyToOne(
    () => RoomCategory,
    roomCategory => roomCategory.rooms,
  )
  @JoinColumn({ name: 'room_category_id' })
  @Type(() => RoomCategory)
  category?: RoomCategory;
}
