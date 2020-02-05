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

  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    const { name, description } = createRoleDto;

    const role = new Role();
    role.name = name;
    role.description = description;

    await role.save();

    return role;
  }
}
