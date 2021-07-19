import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Hmo } from './hmo.entity';
import { HmoType } from './hmo_type.entity';

@Entity({ name: 'hmo_schemes' })
export class HmoScheme extends CustomBaseEntity {
    @Column({ type: 'varchar', length: 300 })
    name: string;

    @ManyToOne(type => Hmo, { eager: true })
    @JoinColumn({ name: 'hmo_id' })
    owner: Hmo;

    @ManyToOne(type => HmoType, { eager: true })
    @JoinColumn({ name: 'hmo_type_id' })
    hmoType: HmoType;

    @Column({ type: 'varchar', length: 300, nullable: true })
    logo: string;

    @Column({ type: 'varchar', length: 300, nullable: true })
    address: string;

    @Column({ type: 'varchar', length: 300, name: 'phone_number' })
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
