import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Entity, ManyToOne, Column, OneToOne, JoinColumn } from 'typeorm';
import { Patient } from '../../entities/patient.entity';
import { AntenatalEnrollment } from './antenatal-enrollment.entity';
import { PatientNote } from '../../entities/patient_note.entity';

@Entity({ name: 'antenatal_assessments'})
export class AntenatalVisits extends CustomBaseEntity {

    @OneToOne(() => AntenatalEnrollment)
    @JoinColumn({name: 'antenatal_enrollment_id'})
    antenatalEnrolment: AntenatalEnrollment;

    @ManyToOne(() => Patient)
    @JoinColumn({name: 'patient_id'})
    patient: Patient;

    @Column('jsonb')
    measurement: string;

    @Column({nullable: true})
    position_of_foetus: string;

    @Column({nullable: true})
    fetal_lie: string;

    @Column({nullable: true})
    relationship_to_brim: string;

    @ManyToOne(type => PatientNote, { nullable: true })
    @JoinColumn({ name: 'note_id' })
    comment: PatientNote;

}
