import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { Patient } from './patient.entity';
import { PatientHistory } from './patient_history.entity';
import { PatientPhysicalExam } from './patient_physical_exam.entity';

@Entity({name: 'patient_antenatals'})
export class PatientAntenatal extends CustomBaseEntity {

    @Column()
    heightOfFunds: string;

    @Column()
    fetalHeartRate: string;

    @Column()
    positionOfFetus: string;

    @Column()
    fetalLie: string;

    @Column()
    relationshipToBrim: string;

    @ManyToOne(type => Patient)
    patient: Patient;

    @OneToMany(() => PatientHistory, item => item.antenatal)
    history: PatientHistory[];

    @OneToMany(() => PatientPhysicalExam, item => item.encounter)
    physicalExams: PatientPhysicalExam[];
}
