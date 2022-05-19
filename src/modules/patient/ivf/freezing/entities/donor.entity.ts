import { CustomBaseEntity } from 'src/common/entities/custom-base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'sperm_oocyte_donor' })
export class SpermOocyteDonor extends CustomBaseEntity {
	@Column({ nullable: true })
	gender: string;

	@Column({ nullable: true })
	age: number;

	@Column({ nullable: true })
	name: string;

	@Column({ nullable: true })
	bloodGroup: string;

	@Column({ nullable: true })
	genotype: string;

	@Column({ nullable: true, type: 'float' })
	height: number;

	@Column({ nullable: true })
	weight: number;

	@Column({ nullable: true })
	bmi: string;

	@Column({ nullable: true })
	complexion: string;

	@Column({ nullable: true })
	stateOfOrigin: string;
}
