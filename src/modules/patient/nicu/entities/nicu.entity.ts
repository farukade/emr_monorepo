import { BaseEntity, Column, CreateDateColumn, Entity, UpdateDateColumn, ManyToOne, JoinColumn, PrimaryGeneratedColumn, Double } from 'typeorm';
import { Patient } from '../../entities/patient.entity';

@Entity({ name: 'nicu' })
export class Nicu extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: string;

    // @ManyToOne(type => Patient)
    // @JoinColumn({ name: 'patient_id' })
    // patient: Patient;

    @Column({ type: 'double precision' })
    temperature: number;

    @Column({ type: 'double precision' })
    pulse: number;

    @Column({ type: 'double precision' })
    resp: number;

    @Column({type: 'varchar'})
    sp02: string

    @Column({ type: 'varchar'})
    oxygen: string

    @Column({type: 'varchar'})
    cypap: string

    @Column({type: 'varchar'})
    offoxygen: string

    @Column({ type: 'varchar' })
    remark: string

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updateAt: Date;


}