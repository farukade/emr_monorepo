import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Patient } from '../../patient/patient.entity';
import { Department } from '../../settings/entities/department.entity';
import { Specialization } from '../../settings/entities/specialization.entity';
import { ConsultingRoom } from '../../settings/entities/consulting-room.entity';

@Entity({ name: 'appointments'})
export class Appointment extends CustomBaseEntity {

    @ManyToOne(
        () => Patient,
        patient => patient.appointments,
    )
    @JoinColumn({name: 'patient_id'})
    patient!: Patient;

    @ManyToOne(type => Department)
    @JoinColumn({ name: 'department_id'})
    department: Department;

    @Column()
    appointment_type: string;

    @ManyToOne(type => Specialization)
    @JoinColumn({ name: 'specialization_id'})
    specialization: Specialization;

    @ManyToOne(type => ConsultingRoom)
    @JoinColumn({ name: 'consulting_room_id'})
    consultingRoom: ConsultingRoom;

    @Column({ nullable: true})
    duration: string;

    @Column({ nullable: true})
    appointment_date: string;

    @Column({ nullable: true })
    referredBy: string;

    @Column({ nullable: true })
    referralCompany: string;

    @Column({nullable: true})
    description: string;
}
