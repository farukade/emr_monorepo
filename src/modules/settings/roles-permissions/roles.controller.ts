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
import { CreateRoleDto } from './dto/role.dto';
import { Role } from '../entities/role.entity';
import { RolesService } from './roles.service';

@Controller('settings/roles')
export class RolesController {
  constructor(private roleService: RolesService) {}

  @Get()
  getAllRolees(): Promise<Role[]> {
    return this.roleService.getAllRole();
  }

  @Post()
  @UsePipes(ValidationPipe)
  createRole(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
    return this.roleService.createRole(createRoleDto);
  }

  @Patch('/:id/update')
  @UsePipes(ValidationPipe)
  updateRole(
    @Param('id') id: string,
    @Body() createRoleDto: CreateRoleDto,
  ): Promise<Role> {
    return this.roleService.updateRole(id, createRoleDto);
  }

  @Delete('/:id')
  deleteRole(@Param('id') id: string): Promise<void> {
    return this.roleService.deleteRole(id);
  }
}
