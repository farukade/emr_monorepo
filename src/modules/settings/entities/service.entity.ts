import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { ServiceCategory } from './service_category.entity';

@Entity({ name: 'services' })
export class Service extends CustomBaseEntity {

	@Column({ type: 'varchar', nullable: true })
	code: string;

	@Column({ type: 'varchar', nullable: true })
	name: string;

	@ManyToOne(type => ServiceCategory, { eager: true })
	@JoinColumn({ name: 'category_id' })
	category: ServiceCategory;
}
