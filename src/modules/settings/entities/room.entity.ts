import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { RoomCategory } from './room_category.entity';
import { Admission } from '../../patient/admissions/entities/admission.entity';

@Entity({ name: 'rooms' })
export class Room extends CustomBaseEntity {

    @Column({ type: 'varchar', length: 300 })
    name: string;

    @Column({ type: 'varchar', length: 300, nullable: true })
    floor: string;

    @Column({ type: 'varchar', default: 'Not Occupied' })
    status: string;

    @ManyToOne(() => RoomCategory, roomCategory => roomCategory.rooms)
    @JoinColumn({ name: 'room_category_id' })
    category: RoomCategory;

    @Column({ nullable: true })
    admission_id: number;
}
