import { Column, Entity } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';

@Entity({ name: 'vendors' })
export class Vendor extends CustomBaseEntity {
    @Column({ type: 'varchar' })
    name: string;
}
