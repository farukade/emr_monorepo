import { Controller, Get, Post, UsePipes, ValidationPipe, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { Department } from '../entities/department.entity';
import { DepartmentDto } from './dto/department.dto';
import { AuthGuard } from '@nestjs/passport';
import { Consumable } from '../entities/consumable.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('departments')
export class DepartmentsController {
    constructor(private departmentService: DepartmentsService) {
    }

    @Get()
    getDepartment(): Promise<Department[]> {
        return this.departmentService.getDepartments();
    }

    @Post()
    @UsePipes(ValidationPipe)
    createDepartment(
        @Body() departmentDto: DepartmentDto,
        @Request() req,
    ): Promise<Department> {
        return this.departmentService.createDepartment(departmentDto, req.user.username);
    }

    @Patch('/:id/update')
    @UsePipes(ValidationPipe)
    updateDepartment(
        @Param('id') id: string,
        @Body() departmentDto: DepartmentDto,
        @Request() req,
    ): Promise<any> {
        return this.departmentService.updateDepartment(id, departmentDto, req.user.username);
    }

    @Delete('/:id')
    deletePackage(
        @Param('id') id: number,
        @Request() req,
    ): Promise<Department> {
        return this.departmentService.deleteDepartment(id, req.user.username);
    }
}
