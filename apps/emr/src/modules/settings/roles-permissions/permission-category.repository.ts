import { EntityRepository, Repository } from 'typeorm';
import { PermissionCategory } from '../entities/permission-category.entity';

@EntityRepository(PermissionCategory)
export class PermissionCategoryRepository extends Repository<PermissionCategory> {}
