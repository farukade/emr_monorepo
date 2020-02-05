import { Controller, Get, Post, UsePipes, ValidationPipe, Body, Patch, Param, Delete } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { Department } from '../entities/department.entity';
import { DepartmentDto } from './dto/department.dto';

@Controller('departments')
export class DepartmentsController {
    constructor(private departmentService: DepartmentsService) {}

    @Get()
    getDepartment(): Promise<Department[]> {
        return this.departmentService.getDepartments();
    }

    @Post()
    @UsePipes(ValidationPipe)
    createDepartment(@Body() departmentDto: DepartmentDto): Promise<Department> {
        return this.departmentService.createDepartment(departmentDto);
    }

    @Patch('/:id/update')
    @UsePipes(ValidationPipe)
    updateDepartment(
        @Param('id') id: string,
        @Body() departmentDto: DepartmentDto,
    ): Promise<Department> {
        return this.departmentService.updateDepartment(id, departmentDto);
    }

    @Delete('/:id')
    deleteDepartment(@Param('id') id: string): Promise<void> {
        return this.departmentService.deleteDepartment(id);
    }
}
