import { Column, Entity, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Patient } from '../../entities/patient.entity';
import { Admission } from '../../admissions/entities/admission.entity';
import { NicuAccommodation } from '../../../settings/entities/nicu-accommodation.entity';

@Entity({ name: 'nicu' })
export class Nicu extends CustomBaseEntity {
    @ManyToOne(type => Patient, patient => patient.nicu)
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @ManyToOne(() => NicuAccommodation, { nullable: true })
    @JoinColumn({ name: 'accommodation_id' })
    accommodation: NicuAccommodation;

    @Column({ nullable: true })
    accommodation_assigned_at: string;

    @Column({ type: 'varchar', nullable: true })
    accommodation_assigned_by: string;

    @Column({ type: 'smallint', default: 0 })
    status: number;

    @OneToOne(() => Admission, item => item.nicu)
    @JoinColumn({ name: 'admission_id' })
    admission: Admission;
}
