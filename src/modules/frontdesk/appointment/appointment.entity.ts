import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Patient } from '../../patient/patient.entity';
import { Department } from '../../settings/entities/department.entity';

@Entity({ name: 'appointments'})
export class Appointment extends CustomBaseEntity {

    @ManyToOne(
        () => Patient,
        patient => patient.appointments,
    )
    @JoinColumn({name: 'patient_id'})
    patient!: Patient;

    @Column({ nullable: true })
    clinical_unit_id: string;

    @ManyToOne(type => Department)
    @JoinColumn({ name: 'department'})
    department: Department;

    @Column()
    appointment_type: string;

    @Column()
    whom_to_see: string;

    @Column({ nullable: true })
    consulting_room: string;

    @Column({ nullable: true})
    duration: string;

    @Column()
    refferedBy: string;

    @Column()
    referralCompany: string;
}