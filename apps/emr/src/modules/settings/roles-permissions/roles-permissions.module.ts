import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { PermissionsService } from './permissions.service';
import { RolesController } from './roles.controller';
import { PermissionsController } from './permissions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleRepository } from './role.repository';
import { PermissionRepository } from './permission.repository';
import { PermissionCategoryRepository } from './permission-category.repository';
import { PermissionCategoryController } from './permission-category.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RoleRepository, PermissionRepository, PermissionCategoryRepository])],
  providers: [RolesService, PermissionsService],
  controllers: [RolesController, PermissionsController, PermissionCategoryController],
})
export class RolesPermissionsModule {}
