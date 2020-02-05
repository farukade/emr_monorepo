import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PermissionsDto } from './dto/permissions.dto';
import { Permission } from '../entities/permission.entity';
import { PermissionsService } from './permissions.service';

@Controller('settings/permissions')
export class PermissionsController {
  constructor(private permissionService: PermissionsService) {}

  @Get()
  getAllPermissions(): Promise<Permission[]> {
    return this.permissionService.getAllPermissions();
  }

  @Post()
  @UsePipes(ValidationPipe)
  createPermission(@Body() permissionDto: PermissionsDto): Promise<Permission> {
    return this.permissionService.createPermission(permissionDto);
  }

  @Patch('/:id/update')
  @UsePipes(ValidationPipe)
  updatePermission(
    @Param('id') id: string,
    @Body() permissionDto: PermissionsDto,
  ): Promise<Permission> {
    return this.permissionService.updatePermission(id, permissionDto);
  }

  @Delete('/:id')
  deletePermission(@Param('id') id: string): Promise<void> {
    return this.permissionService.deletePermission(id);
  }
}
