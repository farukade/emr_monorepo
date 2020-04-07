import { EntityRepository, Repository } from 'typeorm';
import { PermissionsDto } from './dto/permissions.dto';
import { Permission } from '../entities/permission.entity';

@EntityRepository(Permission)
export class PermissionRepository extends Repository<Permission> {
  async getPermissions(): Promise<Permission[]> {
    const query = this.createQueryBuilder('permissions');

    const permissions = await query.getMany();
    return permissions;
  }

  async createPermission(permissionDto: PermissionsDto, createdBy): Promise<Permission> {
    const { name } = permissionDto;

    const permission = new Permission();
    permission.name = name;
    permission.createdBy = createdBy;

    await permission.save();

    return permission;
  }
}
