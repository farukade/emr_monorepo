import {
    BaseEntity,
    Column, CreateDateColumn,
    Entity,
    PrimaryColumn, UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'sms_histories' })
export class SmsHistory extends BaseEntity {
    @PrimaryColumn()
    id: number;

    @Column({ type: 'varchar', length: 300 })
    to_phone: string;

    @Column({ type: 'varchar', length: 300 })
    status: string;

    @Column('jsonb')
    response: any;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}
