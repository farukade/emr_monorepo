import { Column, Entity, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import {Room} from './room.entity';
import { Hmo } from '../../hmo/entities/hmo.entity';

@Entity({ name: 'room_categories' })
export class RoomCategory extends CustomBaseEntity {

    @Column({ type: 'varchar', length: 300 })
    name: string;

    @Column({ type: 'varchar', length: 300, nullable: true })
    price: string;

    @OneToMany(() => Room, room => room.category, { eager: true, onDelete: 'CASCADE' })
    rooms: Room[];

    @ManyToOne(type => Hmo, {nullable: true})
    @JoinColumn({ name: 'hmo_id' })
    public hmo!: Hmo;

    @Column({type: 'varchar', nullable: true})
    hmoTarrif: string;
}
