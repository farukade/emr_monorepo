import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Entity, Column, ManyToOne } from 'typeorm';
import { Admission } from './admission.entity';

@Entity({ name: 'admission_clinical_tasks'})
export class AdmissionClinicalTask extends CustomBaseEntity {
    @Column()
    task: string;

    @Column({nullable: true})
    interval: number;

    @Column({nullable: true})
    intervalType: string;

    @Column({nullable: true})
    taskCount: number;

    @Column({nullable: true})
    startTime: string;

    @ManyToOne(() => Admission)
    admission: Admission;
}
