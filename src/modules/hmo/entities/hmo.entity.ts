import { Column, Entity } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';

@Entity({ name: 'hmo_companies' })
export class Hmo extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 300 })
  name: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 300, name: 'phone_number' })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 300 })
  email: string;
}
