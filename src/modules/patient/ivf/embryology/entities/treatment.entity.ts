import { CustomBaseEntity } from 'src/common/entities/custom-base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'ivf_treatment' })
export class IvfTreatmentEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ nullable: true })
	treatmentChartType: string;

	@Column({ nullable: true })
	isHIVPositive: boolean;

	@Column({ nullable: true })
	isHBSagPositive: boolean;

	@Column({ nullable: true })
	isHcvPositive: boolean;

	@Column({ nullable: true })
	fsh: string;

	@Column({ nullable: true })
	lh: string;

	@Column({ nullable: true })
	prl: string;

	@Column({ nullable: true })
	tsh: string;

	@Column({ nullable: true })
	amh: string;

	@Column({ nullable: true })
	tes: string;

	@Column({ nullable: true })
	numOfEggsReceived: number;

	@Column({ nullable: true })
	instructionsForLab: number;

	@Column({ nullable: true })
	method: string;

	@Column({ nullable: true })
	time: string;

	@Column({ nullable: true })
	leftOvary: string;

	@Column({ nullable: true })
	rightOvary: string;

	@Column({ nullable: true })
	ocrDr: string;

	@Column({ nullable: true })
	embr: string;

	@Column({ nullable: true })
	numOfDocytes: number;

	@Column({ nullable: true })
	total: number;
}
