import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PermissionsDto } from './dto/permissions.dto';
import { Permission } from '../entities/permission.entity';
import { PermissionRepository } from './permission.repository';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(PermissionRepository)
    private permissionRepository: PermissionRepository,
  ) {}

  async getAllPermissions(): Promise<Permission[]> {
    return this.permissionRepository.getPermissions();
  }

  async getPermissionById(id: string): Promise<Permission> {
    const found = this.permissionRepository.findOne(id);

    if (!found) {
      throw new NotFoundException(`Permission with ID '${id}' not found`);
    }

    return found;
  }

  async createPermission(permissionDto: PermissionsDto): Promise<Permission> {
    return this.permissionRepository.createPermission(permissionDto);
  }

  async updatePermission(
    id: string,
    permissionDto: PermissionsDto,
  ): Promise<Permission> {
    const { name } = permissionDto;
    const permission = await this.getPermissionById(id);
    permission.name = name;
    await permission.save();
    return permission;
  }

  async deletePermission(id: string): Promise<void> {
    const result = await this.permissionRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Permission with ID '${id}' not found`);
    }
  }
}
