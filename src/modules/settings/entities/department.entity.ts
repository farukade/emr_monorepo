import { Column, Entity, OneToOne, JoinColumn } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { StaffDetails } from '../../hr/staff/entities/staff_details.entity';

@Entity({ name: 'departments' })
export class Department extends CustomBaseEntity {
	@Column({ type: 'varchar', length: 300 })
	name: string;

	@Column({ type: 'varchar', nullable: true })
	slug: string;

	@Column({ type: 'varchar', length: 300, nullable: true })
	description: string;

	@OneToOne(type => StaffDetails, { eager: true, onDelete: 'CASCADE' })
	@JoinColumn({ name: 'hod_id' })
	staff: StaffDetails;

	@Column({ type: 'int', default: 0 })
	has_appointment: number;
}
