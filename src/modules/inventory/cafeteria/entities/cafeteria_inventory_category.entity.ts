import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Entity, Column } from 'typeorm';

@Entity({name: 'cafeteria_inventory_categories'})
export class CafeteriaInventoryCategory extends CustomBaseEntity {

    @Column({type: 'varchar'})
    name: string;
}
