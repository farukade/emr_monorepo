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
  UseGuards,
  Request,
} from '@nestjs/common';
import { PermissionsDto } from './dto/permissions.dto';
import { Permission } from '../entities/permission.entity';
import { PermissionsService } from './permissions.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('settings/permissions')
export class PermissionsController {
  constructor(private permissionService: PermissionsService) {}

  @Get()
  getAllPermissions(): Promise<Permission[]> {
    return this.permissionService.getAllPermissions();
  }

  @Post()
  @UsePipes(ValidationPipe)
  createPermission(
    @Body() permissionDto: PermissionsDto,
    @Request() req,
  ): Promise<Permission> {
    return this.permissionService.createPermission(permissionDto, req.user.username);
  }

  @Patch('/:id/update')
  @UsePipes(ValidationPipe)
  updatePermission(
    @Param('id') id: string,
    @Body() permissionDto: PermissionsDto,
    @Request() req,
  ): Promise<Permission> {
    return this.permissionService.updatePermission(id, permissionDto, req.user.username);
  }

  @Delete('/:id')
  deletePermission(@Param('id') id: string): Promise<void> {
    return this.permissionService.deletePermission(id);
  }
}
