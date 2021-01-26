import { Controller, Body, ValidationPipe, UsePipes, Post, Get, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { LeaveCategoryService } from './leave-category.service';
import { LeaveCategory } from '../entities/leave.category.entity';
import { LeaveCategoryDto } from './dto/leave.category.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('leave-category')
export class LeaveCategoryController {
    constructor(private leaveCategoryService: LeaveCategoryService) {
    }

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
    deleteServiceCategory(
        @Param('id') id: number,
        @Request() req,
    ): Promise<any> {
        return this.leaveCategoryService.deleteCategory(id, req.user.username);
    }
}
