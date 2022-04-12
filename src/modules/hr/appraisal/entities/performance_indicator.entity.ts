import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { PerformanceAppraisal } from './performance_appraisal.entity';
import { Department } from '../../../settings/entities/department.entity';

@Entity({ name: 'performance_indicators' })
export class PerformanceIndicator extends CustomBaseEntity {
	@Column()
	keyFocus: string;

	@Column()
	objective: string;

	@Column('simple-array')
	kpis: string[];

	@Column({ type: 'boolean', default: false })
	isSettingsObject: boolean;

	@Column()
	weight: string;

	@ManyToOne(
		type => PerformanceAppraisal,
		appraisal => appraisal.indicators,
	)
	appraisal: PerformanceAppraisal;

	@ManyToOne(() => Department, { nullable: true })
	@JoinColumn({ name: 'department_id' })
	department: Department;
}
