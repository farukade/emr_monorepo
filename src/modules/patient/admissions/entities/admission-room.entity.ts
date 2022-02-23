import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Entity, ManyToOne, Column, JoinColumn } from 'typeorm';
import { Room } from '../../../settings/entities/room.entity';
import { Admission } from './admission.entity';

@Entity({ name: 'admission_rooms' })
export class AdmissionRoom extends CustomBaseEntity {
	@ManyToOne(() => Admission)
	@JoinColumn({ name: 'admission_id' })
	admission: Admission;

	@ManyToOne(() => Room, { nullable: true })
	@JoinColumn({ name: 'room_id' })
	room: Room;

	@Column({ nullable: true })
	assigned_at: string;

	@Column({ type: 'varchar', nullable: true })
	assigned_by: string;

	@Column({ nullable: true })
	checked_out_at: string;

	@Column({ type: 'varchar', nullable: true })
	checked_out_by: string;
}
