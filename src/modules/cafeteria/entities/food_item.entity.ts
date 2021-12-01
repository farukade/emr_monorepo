import { Entity, Column } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';

@Entity({name: 'cafeteria_food_items'})
export class CafeteriaFoodItem extends CustomBaseEntity {

    @Column({type: 'varchar'})
    name: string;

    @Column({ type: 'varchar', nullable: true})
    description: string;
}
