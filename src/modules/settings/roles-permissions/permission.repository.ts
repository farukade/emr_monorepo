import { EntityRepository, Repository } from 'typeorm';
import { PermissionsDto } from './dto/permissions.dto';
import { Permission } from '../entities/permission.entity';
import { slugify } from '../../../common/utils/utils';
import * as startCase from 'lodash.startcase';

@EntityRepository(Permission)
export class PermissionRepository extends Repository<Permission> {
  async createPermission(permissionDto: PermissionsDto, category, username): Promise<Permission> {
    const { name } = permissionDto;

    const permission = new Permission();
    permission.name = startCase(name);
    permission.slug = slugify(name);
    permission.category = category;
    permission.createdBy = username;

    await permission.save();

    return permission;
  }
}
