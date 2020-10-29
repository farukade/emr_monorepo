import { Column, Entity } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';

@Entity({ name: 'lab_specimens' })
export class Specimen extends CustomBaseEntity {
    @Column({ type: 'varchar', length: 300, unique: true })
    name: string;
}
