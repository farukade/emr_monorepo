import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Entity, Column, ManyToOne } from 'typeorm';
import { Admission } from './admission.entity';

@Entity({ name: 'admissions'})
export class AdmissionClinicalTask extends CustomBaseEntity {
    @Column()
    task: string;

    @Column()
    interval: number;

    @Column()
    intervalType: string;

    @Column()
    taskCount: number;

    @Column({
        type: Date,
        nullable: true,
    })
    startTime: Date | null;

    @ManyToOne(() => Admission)
    admission: Admission;
}
