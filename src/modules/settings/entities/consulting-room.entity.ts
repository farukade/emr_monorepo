import { Type } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';

@Entity({ name: 'consulting_rooms' })
export class ConsultingRoom extends CustomBaseEntity {
    @Column({ type: 'varchar', length: 300 })
    name: string;
}
