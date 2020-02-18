import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateRoleDto } from './dto/role.dto';
import { Role } from '../entities/role.entity';
import { RoleRepository } from './role.repository';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(RoleRepository)
    private roleRepository: RoleRepository,
  ) {}

  async getAllRole(): Promise<Role[]> {
    return this.roleRepository.getRoles();
  }

  async getRoleById(id: string): Promise<Role> {
    const found = this.roleRepository.findOne(id);

    if (!found) {
      throw new NotFoundException(`Role with ID '${id}' not found`);
    }

    return found;
  }

  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    return this.roleRepository.createRole(createRoleDto);
  }

  async updateRole(id: string, createRoleDto: CreateRoleDto): Promise<Role> {
    const { name, description } = createRoleDto;
    const role = await this.getRoleById(id);
    role.name = name;
    role.slug = this.slugify(name);
    role.description = description;
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
