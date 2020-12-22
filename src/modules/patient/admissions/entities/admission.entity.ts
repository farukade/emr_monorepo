import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Entity, ManyToOne, Column, JoinColumn, OneToMany } from 'typeorm';
import { Patient } from '../../entities/patient.entity';
import { Room } from '../../../settings/entities/room.entity';
import { StaffDetails } from '../../../hr/staff/entities/staff_details.entity';
import { AdmissionClinicalTask } from './admission-clinical-task.entity';
import { AdmissionCareGiver } from './admission-care-giver.entity';

@Entity({ name: 'admissions'})
export class Admission extends CustomBaseEntity {
    @ManyToOne(() => Patient)
    patient: Patient;

    @Column()
    healthState: string;

    @Column({})
    riskToFall: boolean = false;

    @ManyToOne(() => Room)
    room: Room;

    @Column()
    reason: string;

    @Column()
    anticipatedDischargeDate: string;

    @ManyToOne(() => StaffDetails)
    @JoinColumn({name: 'staff_id'})
    careGiver: StaffDetails;

    @OneToMany(() => AdmissionClinicalTask, tasks => tasks.admission)
    tasks: AdmissionClinicalTask;

    @OneToMany(() => AdmissionCareGiver, givers => givers.admission)
    care_givers: AdmissionCareGiver;

    @Column({ type: 'smallint', default: 1})
    status: number;
}
