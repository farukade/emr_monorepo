import { Type } from 'class-transformer';
import { Column, Entity, OneToMany, ManyToOne } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import {Room} from './room.entity';
@Entity({ name: 'room_categories' })
export class RoomCategory extends CustomBaseEntity {

    @Column({ type: 'varchar', length: 300, unique: true })
    name: string;

    @Column({ type: 'varchar', length: 300, nullable: true })
    price: string;

    @Column({ type: 'varchar', length: 300, nullable: true })
    discount: string;

    @OneToMany(
        () => Room,
        room => room.category,
        { eager: true, onDelete: 'CASCADE' },
    )
    rooms: Room[];
}
