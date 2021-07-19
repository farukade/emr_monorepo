import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Entity, ManyToOne, Column, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { Patient } from '../../entities/patient.entity';
import { Room } from '../../../settings/entities/room.entity';
import { AdmissionClinicalTask } from './admission-clinical-task.entity';
import { AdmissionCareGiver } from './admission-care-giver.entity';
import { Nicu } from '../../nicu/entities/nicu.entity';
import { StaffDetails } from '../../../hr/staff/entities/staff_details.entity';

@Entity({ name: 'admissions' })
export class Admission extends CustomBaseEntity {
    @ManyToOne(() => Patient)
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @Column({ nullable: true, name: 'health_state' })
    healthState: string;

    @Column({ default: false, name: 'risk_to_fall' })
    riskToFall: boolean;

    @ManyToOne(() => Room, { nullable: true })
    @JoinColumn({ name: 'room_id' })
    room: Room;

    @Column({ nullable: true, name: 'room_assigned_at' })
    roomAssignedAt: string;

    @ManyToOne(() => StaffDetails, { nullable: true })
    @JoinColumn({ name: 'room_assigned_by' })
    roomAssignedBy: StaffDetails;

    @Column()
    reason: string;

    @OneToMany(() => AdmissionClinicalTask, tasks => tasks.admission)
    tasks: AdmissionClinicalTask;

    @OneToOne(() => Nicu, item => item.admission)
    @JoinColumn({ name: 'nicu_id' })
    nicu: Nicu;

    @OneToMany(() => AdmissionCareGiver, givers => givers.admission)
    careGivers: AdmissionCareGiver;

    @Column({ type: 'smallint', default: 0 })
    status: number;

    @Column({ nullable: true, name: 'date_discharged' })
    dateDischarged: string;

    @ManyToOne(() => StaffDetails, { nullable: true })
    @JoinColumn({ name: 'discharged_by' })
    dischargedBy: StaffDetails;

    @Column({ nullable: true, name: 'discharge_note' })
    dischargeNote: string;
}
