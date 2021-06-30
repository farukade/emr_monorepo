import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Patient } from '../../entities/patient.entity';
import { Room } from '../../../settings/entities/room.entity';
import { StaffDetails } from '../../../hr/staff/entities/staff_details.entity';
import { Admission } from '../../admissions/entities/admission.entity';

@Entity({ name: 'nicu' })
export class Nicu extends CustomBaseEntity {
    @ManyToOne(type => Patient, patient => patient.nicu)
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @Column({ nullable: true })
    room: string;

    @Column({ type: 'smallint', default: 0 })
    status: number;

    @ManyToOne(() => Admission)
    @JoinColumn({name: 'admission_id'})
    admission: Admission;
}
