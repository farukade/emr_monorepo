import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Entity, ManyToOne, Column, JoinColumn } from 'typeorm';
import { Patient } from '../../entities/patient.entity';

@Entity({name: 'antenatal_enrollments'})
export class AntenatalEnrollment extends CustomBaseEntity {

    @ManyToOne(() => Patient)
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @Column()
    bookingPeriod: string;

    @Column('simple-array')
    requiredCare: string[];

    @Column()
    l_m_p: string;

    @Column()
    lmpSource: string;

    @Column()
    e_o_d: string;

    @Column('simple-json')
    fathersInfo: {name: string, phone_number: string, blood_group: string };

    @Column('jsonb')
    obstericsHistory: string;

    @Column('simple-json')
    previousPregnancy: {gravida: string, para: string, alive: string, miscarriage: string, abortion: string };

    @Column()
    enrollmentPackage: string;

    @Column({ type: 'smallint', default: 0 })
    status: number;
}
