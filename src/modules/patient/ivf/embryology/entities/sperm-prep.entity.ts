import { CustomBaseEntity } from 'src/common/entities/custom-base.entity';
import { StaffDetails } from 'src/modules/hr/staff/entities/staff_details.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'ivf_sperm_preparation' })
export class IvfSpermPreparationEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ nullable: true })
	type: string;

	@Column({ nullable: true })
	donorCode: string;

	@Column({ nullable: true })
	viscousity: string;

	@Column({ nullable: true })
	withdrawalMethod: string;

	@Column({ nullable: true })
	timeOfProduction: string;

	@Column({ nullable: true })
	timeReceived: string;

	@Column({ nullable: true })
	timeAnalyzed: string;

	@Column({ nullable: true })
	witness: string;

	@ManyToOne(() => StaffDetails, (staff) => staff.transactions, { nullable: true })
	@JoinColumn({ name: 'staff_id' })
	embryologist: StaffDetails;
}
