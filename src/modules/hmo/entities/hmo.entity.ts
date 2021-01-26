import { Column, Entity } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';

@Entity({ name: 'hmos' })
export class Hmo extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 300 })
  name: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  logo: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  email: string;
}
