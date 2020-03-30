import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Entity, Column } from 'typeorm';

@Entity({name: 'cafeteria_item_categories'})
export class CafeteriaItemCategory extends CustomBaseEntity {

    @Column({type: 'varchar', unique: true})
    name: string;
}
