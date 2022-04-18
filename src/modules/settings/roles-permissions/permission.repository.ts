import { EntityRepository, Repository } from 'typeorm';
import { PermissionsDto } from './dto/permissions.dto';
import { Permission } from '../entities/permission.entity';
import { slugify } from '../../../common/utils/utils';

@EntityRepository(Permission)
export class PermissionRepository extends Repository<Permission> {
	async createPermission(
		permissionDto: PermissionsDto,
		category,
		username,
	): Promise<Permission> {
		const { name } = permissionDto;

		const permission = new Permission();
		permission.name = name;
		permission.slug = slugify(name);
		permission.category = category;
		permission.createdBy = username;

		await permission.save();

		return permission;
	}
}
