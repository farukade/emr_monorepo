import { Entity, Column } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';

@Entity({ name: 'consumables'})
export class Consumable extends CustomBaseEntity {

    @Column()
    name: string;

    @Column({nullable: true})
    description: string;

}
