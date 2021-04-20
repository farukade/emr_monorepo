import { Controller, Post, Body, Param, Request, Delete, UseGuards, Get, Query, UsePipes, ValidationPipe, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { AntenatalPackageService } from './antenatal-package.service';
import { Group } from '../entities/group.entity';
import { AntenatalPackage } from '../entities/antenatal-package.entity';
import { AntenatalPackageDto } from './dto/antenatal-package.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('antenatal-packages')
export class AntenatalPackageController {
    constructor(
        private packageService: AntenatalPackageService,
    ) {}

    @Get('')
    getEnrollments(
        @Query() urlParams,
        @Request() request,
    ): Promise<Pagination> {
        const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
        const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
        return this.packageService.getPackages({page, limit}, urlParams);
    }

    @Post('/save')
    @UsePipes(ValidationPipe)
    savePackage(
        @Body() createDto: AntenatalPackageDto,
        @Request() req,
    ) {
        return this.packageService.savePackage(createDto, req.user.username);
    }

    @Patch('/:id/update')
    @UsePipes(ValidationPipe)
    updatePackage(
        @Param('id') id: number,
        @Body() updateDto: AntenatalPackageDto,
        @Request() req,
    ) {
        return this.packageService.updatePackage(id, updateDto, req.user.username);
    }

    @Delete('/:id')
    deletePackage(
        @Param('id') id: number,
        @Request() req,
    ): Promise<AntenatalPackage> {
        return this.packageService.deletePackage(id, req.user.username);
    }
}
