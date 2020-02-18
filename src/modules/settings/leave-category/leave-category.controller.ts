import { Controller, Body, ValidationPipe, UsePipes, Post, Get, Patch, Param, Delete } from '@nestjs/common';
import { LeaveCategoryService } from './leave-category.service';
import { LeaveCategory } from '../entities/leave.category.entity';
import { LeaveCategoryDto } from './dto/leave.category.dto';

@Controller('leave-category')
export class LeaveCategoryController {
    constructor(private leaveCategoryService: LeaveCategoryService) {}

    @Get()
    getCategories(): Promise<LeaveCategory[]> {
        return this.leaveCategoryService.getCategories();
    }

    @Post()
    @UsePipes(ValidationPipe)
    createLabTestCategory(@Body() leaveCategoryDto: LeaveCategoryDto): Promise<LeaveCategory> {
        return this.leaveCategoryService.createCategory(leaveCategoryDto);
    }

    @Patch(':id/update')
    @UsePipes(ValidationPipe)
    updateCategory(
        @Param('id') id: string,
        @Body() leaveCategoryDto: LeaveCategoryDto,
    ): Promise<LeaveCategory> {
        return this.leaveCategoryService.updateCategory(id, leaveCategoryDto);
    }

    @Delete(':id')
    deleteServiceCategory(@Param('id') id: string): Promise<void> {
        return this.leaveCategoryService.deleteCategory(id);
    }
}
