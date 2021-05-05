import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Patient } from './patient.entity';

@Entity({ name: 'patient_fluid_charts'})
export class PatientFluidChart extends CustomBaseEntity {

    @Column({nullable: true})
    type: string;

    @Column({nullable: true})
    fluid_route: string;

    @Column({ type: 'float4', nullable: true })
    volume: number;

    @ManyToOne(type => Patient)
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

}
