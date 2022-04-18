import { EntityRepository, Repository } from 'typeorm';
import { CreateRoleDto } from './dto/role.dto';
import { Role } from '../entities/role.entity';
import { slugify } from '../../../common/utils/utils';

@EntityRepository(Role)
export class RoleRepository extends Repository<Role> {
	async createRole(
		createRoleDto: CreateRoleDto,
		username: string,
	): Promise<Role> {
		const { name, description } = createRoleDto;

		const role = new Role();
		role.name = name;
		role.slug = slugify(name);
		role.description = description;
		role.createdBy = username;

		await role.save();

		return role;
	}
}
