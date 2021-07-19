import { Column, Entity } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';

@Entity({ name: 'drug_categories' })
export class DrugCategory extends CustomBaseEntity {
    @Column({ type: 'varchar', length: 300 })
    name: string;
}
