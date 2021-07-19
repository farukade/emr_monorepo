import { Column, Entity, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import {Room} from './room.entity';
import { HmoScheme } from '../../hmo/entities/hmo_scheme.entity';

@Entity({ name: 'room_categories' })
export class RoomCategory extends CustomBaseEntity {

    @Column({ type: 'varchar', length: 300 })
    name: string;

    @Column({ type: 'varchar', length: 300, nullable: true })
    price: string;

    @OneToMany(() => Room, room => room.category, { eager: true, onDelete: 'CASCADE' })
    rooms: Room[];

    @ManyToOne(type => HmoScheme, { nullable: true })
    @JoinColumn({ name: 'hmo_scheme_id' })
    hmo: HmoScheme;

    @Column({type: 'varchar', nullable: true})
    hmoTarrif: string;
}
