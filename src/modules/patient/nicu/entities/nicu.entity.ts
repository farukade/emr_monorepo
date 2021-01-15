import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Patient } from '../../entities/patient.entity';

@Entity({ name: 'nicu' })
export class Nicu extends CustomBaseEntity {
    @ManyToOne(type => Patient, patient => patient.nicu, { nullable: true })
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @Column({ type: 'double precision' })
    temperature: number;

    @Column({ type: 'double precision' })
    pulse: number;

    @Column({ type: 'double precision' })
    resp: number;

    @Column({ type: 'varchar' })
    sp02: string;

    @Column({ type: 'varchar' })
    oxygen: string;

    @Column({ type: 'varchar' })
    cypap: string;

    @Column({ type: 'varchar' })
    offoxygen: string;

    @Column({ type: 'varchar' })
    remark: string;
}
