import { Controller, Post, Body, Param, Request, Delete, UseGuards, Get, Query, UsePipes, ValidationPipe, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { ConsumableService } from './consumable.service';
import { ConsumableDto } from './dto/consumable.dto';
import { Consumable } from '../entities/consumable.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('consumables')
export class ConsumableController {
    constructor(
        private consumableService: ConsumableService,
    ) {}

    @Get('')
    getEnrollments(
        @Query() urlParams,
        @Request() request,
    ): Promise<Pagination> {
        const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
        const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
        return this.consumableService.getConsumables({page, limit}, urlParams);
    }

    @Post('/save')
    @UsePipes(ValidationPipe)
    savePackage(
        @Body() createDto: ConsumableDto,
        @Request() req,
    ) {
        return this.consumableService.saveConsumabe(createDto, req.user.username);
    }

    @Patch('/:id/update')
    @UsePipes(ValidationPipe)
    updatePackage(
        @Param('id') id: number,
        @Body() updateDto: ConsumableDto,
        @Request() req,
    ) {
        return this.consumableService.updateConsumable(id, updateDto, req.user.username);
    }

    @Delete('/:id')
    deletePackage(
        @Param('id') id: number,
        @Request() req,
    ): Promise<Consumable> {
        return this.consumableService.deleteConsumable(id, req.user.username);
    }
}
