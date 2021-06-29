import { Entity, Column } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';

@Entity({ name: 'service_logs' })
export class LogEntity extends CustomBaseEntity {

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    type: string;

    @Column({ nullable: true })
    message: string;

    @Column({ nullable: true })
    status: string;

    @Column({ nullable: true })
    errorMessage: string;

    @Column({ nullable: true })
    category: string;

    @Column({ nullable: true, type: 'jsonb' })
    data: string;
}
