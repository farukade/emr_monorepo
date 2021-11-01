import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Entity, ManyToOne, Column, JoinColumn, OneToOne } from 'typeorm';
import { Patient } from '../../entities/patient.entity';
import { AntenatalPackage } from '../../../settings/entities/antenatal-package.entity';

@Entity({name: 'antenatal_enrollments'})
export class AntenatalEnrollment extends CustomBaseEntity {

    @Column()
    serial_code: string;

    @ManyToOne(() => Patient)
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @Column()
    booking_period: string;

    @Column('jsonb')
    doctors: string;

    @Column()
    lmp: string;

    @Column()
    lmp_source: string;

    @Column()
    edd: string;

    @Column('simple-json')
    father: {name: string, phone: string, blood_group: string };

    @Column('jsonb')
    history: string;

    @Column('simple-json')
    pregnancy_history: {gravida: string, para: string, alive: string, miscarriage: string, abortion: string };

    @OneToOne(() => AntenatalPackage, item => item.enrolment)
    @JoinColumn({ name: 'package_id' })
    package: AntenatalPackage;

    @Column({ type: 'smallint', default: 0 })
    status: number;
}
