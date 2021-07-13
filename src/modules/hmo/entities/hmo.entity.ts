import { Column, Entity, OneToMany } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { RoomCategory } from '../../settings/entities/room_category.entity';

@Entity({ name: 'hmos' })
export class Hmo extends CustomBaseEntity {
    @Column({ type: 'varchar', length: 300 })
    name: string;

    @Column({ type: 'varchar', length: 300, nullable: true })
    logo: string;

    @Column({ type: 'varchar', length: 300, nullable: true })
    address: string;

    @Column({ type: 'varchar', length: 300 })
    phoneNumber: string;

    @Column({ type: 'varchar', length: 300 })
    email: string;

    @Column({ type: 'varchar', nullable: true, name: 'cac_number' })
    cacNumber: string;

    @Column({ type: 'varchar', default: 'full', name: 'coverage_type' })
    coverageType: string;

    @Column({ nullable: true })
    coverage: number;

}
