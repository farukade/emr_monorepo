import { EntityRepository, Repository } from 'typeorm';
import { CreateRoleDto } from './dto/role.dto';
import { Role } from '../entities/role.entity';

@EntityRepository(Role)
export class RoleRepository extends Repository<Role> {
  async getRoles(): Promise<Role[]> {
    const query = this.createQueryBuilder('roles');

    const roles = await query.getMany();
    return roles;
  }

  async createRole(createRoleDto: CreateRoleDto, userId: string): Promise<Role> {
    const { name, description } = createRoleDto;

    const role = new Role();
    role.name = name;
    role.slug = this.slugify(name);
    role.description = description;
    role.createdBy = userId;

    await role.save();

    return role;
  }

  slugify(text) {
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, ''); // Trim - from end of text
  }
}
