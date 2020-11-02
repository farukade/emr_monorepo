import { Controller, Get, Post, UsePipes, ValidationPipe, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { LabService } from './lab.service';
import { LabTestCategory } from '../entities/lab_test_category.entity';
import { LabCategoryDto } from './dto/lab.category.dto';
import { Parameter } from '../entities/parameters.entity';
import { ParameterDto } from './dto/parameter.dto';
import { LabTest } from '../entities/lab_test.entity';
import { LabTestDto } from './dto/lab_test.dto';
import { AuthGuard } from '@nestjs/passport';
import { Specimen } from '../entities/specimen.entity';
import { SpecimenDto } from './dto/specimen.dto';
import { Group } from '../entities/group.entity';
import { GroupDto } from './dto/group.dto';
import { Pagination } from '../../../common/paginate/paginate.interface';

@UseGuards(AuthGuard('jwt'))
@Controller('lab-tests')
export class LabController {

    constructor(private labService: LabService) {}

    /**
     * LAB TESTs
     */
    @Get()
    getLabTests(
        @Request() request,
        @Query('q') q: string,
    ): Promise<Pagination> {
        const limit = request.query.hasOwnProperty('limit') ? request.query.limit : 30;
        const page = request.query.hasOwnProperty('page') ? request.query.page : 1;

        return this.labService.getTests({ page, limit }, q);
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
    deleteLabTest(@Param('id') id: string): Promise<LabTest> {
        return this.labService.deleteLabTest(id);
    }

    /**
     * LAB CATEGORIES
     */
    @Get('/categories')
    getCategories(
        @Query('hasTest') hasTest: string,
    ): Promise<any[]> {
        return this.labService.getCategories(hasTest === '1');
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
    deleteServiceCategory(@Param('id') id: string): Promise<LabTestCategory> {
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

    /**
     * LAB SPECIMEN
     */
    @Get('/specimens')
    getSpecimens(): Promise<Specimen[]> {
        return this.labService.getSpecimens();
    }

    @Post('/specimens')
    @UsePipes(ValidationPipe)
    createSpecimen(
        @Body() specimenDto: SpecimenDto,
        @Request() req,
    ): Promise<Specimen> {
        return this.labService.createSpecimen(specimenDto, req.user.username);
    }

    @Patch('/specimens/:id')
    @UsePipes(ValidationPipe)
    updateSpecimen(
        @Param('id') id: string,
        @Body() specimenDto: SpecimenDto,
        @Request() req,
    ): Promise<Specimen> {
        return this.labService.updateSpecimen(id, specimenDto, req.user.username);
    }

    @Delete('/specimens/:id')
    deleteSpecimen(@Param('id') id: string): Promise<Specimen> {
        return this.labService.deleteSpecimen(id);
    }

    /**
     * LAB TEST GROUP
     */
    @Get('/groups')
    getGroups(): Promise<Group[]> {
        return this.labService.getGroups();
    }

    @Post('/groups')
    @UsePipes(ValidationPipe)
    createGroup(
        @Body() specimenDto: GroupDto,
        @Request() req,
    ): Promise<Group> {
        return this.labService.createGroup(specimenDto, req.user.username);
    }

    @Patch('/groups/:id')
    @UsePipes(ValidationPipe)
    updateGroup(
        @Param('id') id: string,
        @Body() groupDto: GroupDto,
        @Request() req,
    ): Promise<Group> {
        return this.labService.updateGroup(id, groupDto, req.user.username);
    }

    @Delete('/groups/:id')
    deleteGroup(@Param('id') id: string): Promise<Group> {
        return this.labService.deleteGroup(id);
    }
}
