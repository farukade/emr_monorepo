import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Entity, Column } from 'typeorm';

@Entity({ name: 'patient_next_of_kins' })
export class PatientNOK extends CustomBaseEntity {

    @Column({ type: 'varchar'})
    surname: string;

    @Column({ type: 'varchar'})
    other_names: string;

    @Column({ type: 'varchar', nullable: true})
    date_of_birth: string;

    @Column({ type: 'varchar', nullable: true})
    relationship: string;

    @Column({ type: 'varchar', nullable: true})
    occupation: string;

    @Column({ type: 'varchar', nullable: true})
    address: string;

    @Column({ type: 'varchar', nullable: true})
    email: string;

    @Column({ type: 'varchar'})
    phoneNumber: string;

    @Column({ type: 'varchar', nullable: true})
    gender: string;

    @Column({ type: 'varchar', nullable: true})
    maritalStatus: string;

    @Column({ type: 'varchar', nullable: true})
    ethnicity: string;
}
