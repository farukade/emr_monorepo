import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { LabourEnrollment } from './labour_enrollment.entity';

@Entity({name: 'labour_risk_assessments'})
export class LabourRiskAssessment extends CustomBaseEntity {

    @Column()
    height: string;

    @Column()
    weight: string;

    @Column()
    previousPregnancyOutcome: string;

    @Column('simple-array')
    previousPregnancyExperience: string[];

    @Column()
    note: string;

    @ManyToOne(() => LabourEnrollment)
    @JoinColumn({name: 'enrollment_id'})
    enrollment: LabourEnrollment;
}
