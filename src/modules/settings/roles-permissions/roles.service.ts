import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateRoleDto } from './dto/role.dto';
import { Role } from '../entities/role.entity';
import { RoleRepository } from './role.repository';
import { User } from '../../hr/entities/user.entity';
import { StaffDetails } from '../../hr/staff/entities/staff_details.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(RoleRepository)
    private roleRepository: RoleRepository,
  ) {}

  async getAllRole(): Promise<Role[]> {
    return await this.roleRepository.createQueryBuilder('role')
          .leftJoin(User, 'creator', 'role.createdBy = creator.username')
          // .innerJoin(User, 'updator', 'role.lastChangedBy = updator.username')
          .innerJoin(StaffDetails, 'staff1', 'staff1.user_id = creator.id')
          // .innerJoin(StaffDetails, 'staff2', 'staff2.user_id = updator.id')
          .select('role.id, role.name, role.description')
          .addSelect('CONCAT(staff1.first_name || \' \' || staff1.last_name) as created_by, staff1.id as created_by_id')
          // .addSelect('CONCAT(staff2.first_name || \' \' || staff2.last_name) as updated_by, staff2.id as updated_by_id')
          .getRawMany();
  }

  async getRoleById(id: string): Promise<Role> {
    const found = this.roleRepository.findOne(id);

    if (!found) {
      throw new NotFoundException(`Role with ID '${id}' not found`);
    }

    return found;
  }

  async createRole(createRoleDto: CreateRoleDto, username: string): Promise<Role> {
    return this.roleRepository.createRole(createRoleDto, username);
  }

  async updateRole(id: string, createRoleDto: CreateRoleDto, username: string): Promise<Role> {
    const { name, description } = createRoleDto;
    const role = await this.getRoleById(id);
    role.name = name;
    role.slug = this.slugify(name);
    role.description = description;
    role.lastChangedBy = username;
    await role.save();
    return role;
  }

  async deleteRole(id: string): Promise<void> {
    const result = await this.roleRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Role with ID '${id}' not found`);
    }
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
