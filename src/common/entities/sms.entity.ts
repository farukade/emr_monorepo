import {
  BaseEntity,
  Column,
  Entity,
  PrimaryColumn,
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
    response: string;

}
