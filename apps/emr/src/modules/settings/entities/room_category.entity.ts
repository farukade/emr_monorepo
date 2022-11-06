import { Column, Entity, OneToMany } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Room } from './room.entity';

@Entity({ name: 'room_categories' })
export class RoomCategory extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 300 })
  name: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  code: string;

  @OneToMany(() => Room, (room) => room.category, { eager: true })
  rooms: Room[];
}
