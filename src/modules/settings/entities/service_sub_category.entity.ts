import { Type } from 'class-transformer';
import { Column, Entity, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Service } from './service.entity';
import { ServiceCategory } from './service_category.entity';

@Entity({ name: 'service_sub_categories' })
export class ServiceSubCategory extends CustomBaseEntity {
    @Column({ type: 'varchar', length: 300 })
    name: string;

    @ManyToOne(
        () => ServiceCategory,
        category => category.subCateogries,
    )
    @JoinColumn({ name: 'service_category_id' })
    category: ServiceCategory;

    @OneToMany(
        () => Service,
        service => service.subCategory,
        { onDelete: 'CASCADE' },
    )
    services: Service[];
}
