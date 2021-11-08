import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Entity, ManyToOne, Column, JoinColumn } from 'typeorm';
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
    doctors: any;

    @Column()
    lmp: string;

    @Column()
    lmp_source: string;

    @Column()
    edd: string;

    @Column('simple-json')
    father: {name: string, phone: string, blood_group: string };

    @Column('jsonb')
    history: any;

    @Column('simple-json')
    pregnancy_history: {gravida: string, para: string, alive: string, miscarriage: string, abortion: string };

    @ManyToOne(() => AntenatalPackage, item => item.enrolment, { nullable: true })
    @JoinColumn({ name: 'package_id' })
    ancpackage: AntenatalPackage;

    @Column({ type: 'smallint', default: 0 })
    status: number;
}
