import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PermissionsDto } from './dto/permissions.dto';
import { Permission } from '../entities/permission.entity';
import { PermissionRepository } from './permission.repository';
import { User } from '../../hr/entities/user.entity';
import { StaffDetails } from '../../hr/staff/entities/staff_details.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(PermissionRepository)
    private permissionRepository: PermissionRepository,
  ) {}

  async getAllPermissions(): Promise<Permission[]> {
    return await this.permissionRepository.createQueryBuilder('q')
    .leftJoin(User, 'creator', 'q.createdBy = creator.username')
    .innerJoin(User, 'updator', 'q.lastChangedBy = updator.username')
    .innerJoin(StaffDetails, 'staff1', 'staff1.user_id = creator.id')
    .innerJoin(StaffDetails, 'staff2', 'staff2.user_id = updator.id')
    .select('q.id, q.name')
    .addSelect('CONCAT(staff1.first_name || \' \' || staff1.last_name) as created_by, staff1.id as created_by_id')
    .addSelect('CONCAT(staff2.first_name || \' \' || staff2.last_name) as updated_by, staff2.id as updated_by_id')
    .getRawMany();
  }

  async getPermissionById(id: string): Promise<Permission> {
    const found = this.permissionRepository.findOne(id);

    if (!found) {
      throw new NotFoundException(`Permission with ID '${id}' not found`);
    }

    return found;
  }

  async createPermission(permissionDto: PermissionsDto, creatdBy): Promise<Permission> {
    return this.permissionRepository.createPermission(permissionDto, creatdBy);
  }

  async updatePermission(
    id: string,
    permissionDto: PermissionsDto,
    updatedBy: string,
  ): Promise<Permission> {
    const { name } = permissionDto;
    const permission = await this.getPermissionById(id);
    permission.name = name;
    permission.lastChangedBy = updatedBy;
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
