import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateRoleDto } from './dto/role.dto';
import { Role } from '../entities/role.entity';
import { RoleRepository } from './role.repository';
import {getConnection} from 'typeorm';
import {PermissionRepository} from './permission.repository';
import {slugify} from '../../../common/utils/utils';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(RoleRepository)
    private roleRepository: RoleRepository,
    @InjectRepository(PermissionRepository)
    private permissionRepository: RoleRepository,
  ) {}

  async getAllRole(): Promise<Role[]> {
    return this.roleRepository.find({ relations: ['permissions']});
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

  async addPermissions(param): Promise<any> {
    try {
      // find role
      const role = await this.roleRepository.findOne(param.role_id);
      if (!role) {
        throw new NotFoundException(`Selected role was not found`);
      }
      // save permissions
      return this.syncPermissions(role, param.permissions);
    } catch (err) {
      return {success: false, message: err.message};
    }
  }

  async updateRole(id: string, createRoleDto: CreateRoleDto, username: string): Promise<Role> {
    const { name, description } = createRoleDto;
    const role = await this.getRoleById(id);
    role.name = name;
    role.slug = slugify(name);
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

  async syncPermissions(role: Role, permissions) {
    try {
      // remove previous permissions
      await getConnection()
          .createQueryBuilder()
          .delete()
          .from('roles_permissions_permissions')
          .where('"rolesId" = :roleId', {roleId: role.id})
          .execute();

      const selectedPermission = [];

      for (const permission of permissions) {
        const rolePermission = await this.permissionRepository.findOne(permission);
        selectedPermission.push(rolePermission);
      }

      role.permissions = selectedPermission;
      await role.save();

      return {success: true};
    } catch (err ) {
      return {success: false, message: err.message};
    }
  }
}
