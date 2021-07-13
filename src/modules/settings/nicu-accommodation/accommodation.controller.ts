import { Controller, Post, Body, Param, Request, Delete, UseGuards, Get, Query, UsePipes, ValidationPipe, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { NicuAccommodationService } from './accommodation.service';
import { AccommodationDto } from './dto/accommodation.dto';
import { NicuAccommodation } from '../entities/nicu-accommodation.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('nicu-accommodations')
export class NicuAccommodationController {
    constructor(
        private accommodationService: NicuAccommodationService,
    ) {}

    @Get('')
    getAccommodations(
        @Query() urlParams,
        @Request() request,
    ): Promise<Pagination> {
        const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
        const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
        return this.accommodationService.getAccommodations({page, limit}, urlParams);
    }

    @Post('')
    @UsePipes(ValidationPipe)
    saveAccommodation(
        @Body() createDto: AccommodationDto,
        @Request() req,
    ) {
        return this.accommodationService.saveAccommodation(createDto, req.user.username);
    }

    @Patch('/:id')
    @UsePipes(ValidationPipe)
    updateAccommodation(
        @Param('id') id: number,
        @Body() updateDto: AccommodationDto,
        @Request() req,
    ) {
        return this.accommodationService.updateAccommodation(id, updateDto, req.user.username);
    }

    @Delete('/:id')
    deleteAccommodation(
        @Param('id') id: number,
        @Request() req,
    ): Promise<NicuAccommodation> {
        return this.accommodationService.deleteAccommodation(id, req.user.username);
    }
}
