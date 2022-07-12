import { Controller, Get, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { AuthGuard } from '@nestjs/passport';
import { PermissionCategory } from '../entities/permission-category.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('settings/permission-categories')
export class PermissionCategoryController {
  constructor(private permissionService: PermissionsService) {}

  @Get('')
  getAllPermissions(): Promise<PermissionCategory[]> {
    return this.permissionService.getPermissionCategories();
  }
}
