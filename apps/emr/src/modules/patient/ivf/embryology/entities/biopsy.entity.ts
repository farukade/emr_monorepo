import { CustomBaseEntity } from "apps/emr/src/common/entities/custom-base.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { IvfEmbryoAssessment } from "./embryo-assessment.entity";

@Entity({ name: 'ivf_biopsy' })
export class Biopsy extends CustomBaseEntity {
    @Column({ nullable: true })
    type: string;

    @Column({ nullable: true })
    one: string;

    @Column({ nullable: true })
    two: string;

    @Column({ nullable: true })
    three: string;

    @Column({ nullable: true })
    four: string;

    @Column({ nullable: true })
    five: string;

    @Column({ nullable: true })
    six: string;

    @Column({ nullable: true })
    seven: string;

    @Column({ nullable: true })
    eight: string;

    @Column({ nullable: true })
    nine: string;

    @Column({ nullable: true })
    ten: string;

    @Column({ nullable: true })
    eleven: string;

    @Column({ nullable: true })
    twelve: string;

    @ManyToOne(() => IvfEmbryoAssessment, assessment => assessment.biopsy)
    @JoinColumn({ name: 'assessment_id' })
    assessment: IvfEmbryoAssessment;
  
}