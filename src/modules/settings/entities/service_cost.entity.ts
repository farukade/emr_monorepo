import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { HmoScheme } from '../../hmo/entities/hmo_scheme.entity';
import { Service } from './service.entity';

@Entity({ name: 'service_costs' })
export class ServiceCost extends CustomBaseEntity {

    @Column({ type: 'varchar', nullable: true })
    code: string;

    @ManyToOne(type => Service, { eager: true })
    @JoinColumn({ name: 'service_id' })
    item: Service;

    @ManyToOne(type => HmoScheme, { eager: true })
    @JoinColumn({ name: 'hmo_scheme_id' })
    hmo: HmoScheme;

    @Column({ type: 'float8', default: 0.0 })
    tariff: number;
}
