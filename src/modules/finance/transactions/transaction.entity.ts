import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Patient } from '../../patient/entities/patient.entity';
import { Department } from '../../settings/entities/department.entity';
import { Service } from '../../settings/entities/service.entity';

@Entity({ name: 'transactions'})
export class Transactions extends CustomBaseEntity {

    @ManyToOne(
        () => Patient,
        patient => patient.appointments,
    )
    @JoinColumn({name: 'patient_id'})
    patient!: Patient;

    @ManyToOne(type => Service, {nullable: true})
    @JoinColumn({ name: 'service_id'})
    serviceType: Service;

    @ManyToOne(type => Department, {nullable: true})
    @JoinColumn({ name: 'department_id'})
    department: Department;

    @Column({type: 'float4', nullable: true})
    amount: number;

    @Column({nullable: true})
    description: string;

    @Column({type: 'smallint', default: 0})
    status: number;
}
