import { Controller, Get, Post, UsePipes, ValidationPipe, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { LabService } from './lab.service';
import { LabTestCategory } from '../entities/lab_test_category.entity';
import { LabCategoryDto } from './dto/lab.category.dto';
import { Parameter } from '../entities/parameters.entity';
import { ParameterDto } from './dto/parameter.dto';
import { LabTest } from '../entities/lab_test.entity';
import { LabTestDto } from './dto/lab_test.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('lab-tests')
export class LabController {

    constructor(private labService: LabService) {}

    /**
     * LAB TESTs
     */
    @Get()
    getLabTests(): Promise<LabTest[]> {
        return this.labService.getTests();
    }

    @Post()
    @UsePipes(ValidationPipe)
    createLabTest(
        @Body() labTestDto: LabTestDto,
        @Request() req,
    ): Promise<any> {
        const { parameters } = labTestDto;
        return this.labService.createLabTest(labTestDto, req.user.username);
    }

    @Patch(':id/update')
    @UsePipes(ValidationPipe)
    updateLabTest(
        @Param('id') id: string,
        @Body() labTestDto: LabTestDto,
        @Request() req,
    ): Promise<LabTest> {
        return this.labService.updateLabTest(id, labTestDto, req.user.username);
    }

    @Delete(':id')
    deleteLabTest(@Param('id') id: string): Promise<void> {
        return this.labService.deleteLabTest(id);
    }

    /**
     * LAB CATEGORIES
     */
    @Get('/categories')
    getCategories(): Promise<LabTestCategory[]> {
        return this.labService.getCategories();
    }

    @Post('/categories')
    @UsePipes(ValidationPipe)
    createLabTestCategory(
        @Body() labCategoryDto: LabCategoryDto,
        @Request() req,
    ): Promise<LabTestCategory> {
        return this.labService.createCategory(labCategoryDto, req.user.username);
    }

    @Patch('categories/:id/update')
    @UsePipes(ValidationPipe)
    updateCategory(
        @Param('id') id: string,
        @Body() labCategoryDto: LabCategoryDto,
        @Request() req,
    ): Promise<LabTestCategory> {
        return this.labService.updateCategory(id, labCategoryDto, req.user.username);
    }

    @Delete('categories/:id')
    deleteServiceCategory(@Param('id') id: string): Promise<void> {
        return this.labService.deleteCategory(id);
    }

    /**
     * LAB PARAMETERS
     */
    @Get('/parameters')
    getParameters(): Promise<LabTestCategory[]> {
        return this.labService.getParameters();
    }

    @Post('/parameters')
    @UsePipes(ValidationPipe)
    createParameters(@Body() parameterDto: ParameterDto): Promise<Parameter> {
        return this.labService.createParameter(parameterDto);
    }

    @Patch('parameters/:id/update')
    @UsePipes(ValidationPipe)
    updateParameter(
        @Param('id') id: string,
        @Body() parameterDto: ParameterDto,
    ): Promise<Parameter> {
        return this.labService.updateParameter(id, parameterDto);
    }

    @Delete('parameters/:id')
    deleteParameter(@Param('id') id: string): Promise<void> {
        return this.labService.deleteParameter(id);
    }
}
