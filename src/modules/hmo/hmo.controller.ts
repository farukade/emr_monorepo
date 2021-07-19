import { Controller, Get, Post, UsePipes, ValidationPipe, Body, Patch, Param, Delete, Query, Request, UseGuards } from '@nestjs/common';
import { HmoService } from './hmo.service';
import { Hmo } from './entities/hmo.entity';
import { HmoDto } from './dto/hmo.dto';
import { AuthGuard } from '@nestjs/passport';
import { Pagination } from '../../common/paginate/paginate.interface';
import { HmoSchemeDto } from './dto/hmo_scheme.dto';
import { HmoType } from './entities/hmo_type.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('hmos')
export class HmoController {
    constructor(private hmoService: HmoService) {
    }

    @Get('/owners')
    getHmo(
        @Query() params,
        @Request() request,
    ): Promise<Pagination> {
        const limit = request.query.hasOwnProperty('limit') ? request.query.limit : 10;
        const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;

        return this.hmoService.fetchHmos({ page, limit }, params);
    }

    @Get('/schemes')
    getSchemes(
        @Query() params,
        @Request() request,
    ): Promise<Pagination> {
        const limit = request.query.hasOwnProperty('limit') ? request.query.limit : 10;
        const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;

        return this.hmoService.fetchSchemes({ page, limit }, params);
    }

    @Post('/owners')
    @UsePipes(ValidationPipe)
    createHmo(
        @Body() hmoDto: HmoDto,
    ): Promise<Hmo> {
        return this.hmoService.createHmo(hmoDto);
    }

    @Post('/schemes')
    @UsePipes(ValidationPipe)
    createScheme(
        @Body() hmoSchemeDto: HmoSchemeDto,
    ): Promise<Hmo> {
        return this.hmoService.createScheme(hmoSchemeDto);
    }

    @Patch('/owners/:id')
    updateHmo(
        @Param('id') id: string,
        @Body() hmoDto: HmoDto,
    ): Promise<Hmo> {
        return this.hmoService.updateHmo(id, hmoDto);
    }

    @Patch('/schemes/:id')
    updateScheme(
        @Param('id') id: string,
        @Body() hmoSchemeDto: HmoSchemeDto,
    ): Promise<Hmo> {
        return this.hmoService.updateScheme(id, hmoSchemeDto);
    }

    @Delete('/owners/:id')
    deleteHmo(
        @Param('id') id: number,
        @Request() req,
    ): Promise<any> {
        return this.hmoService.deleteHmo(id, req.user.username);
    }

    @Delete('/schemes/:id')
    deleteScheme(
        @Param('id') id: number,
        @Request() req,
    ): Promise<any> {
        return this.hmoService.deleteScheme(id, req.user.username);
    }

    @Get('/transactions')
    getHmoTransactions(
        @Query() params,
        @Request() request,
    ): Promise<Pagination> {
        const limit = request.query.hasOwnProperty('limit') ? request.query.limit : 10;
        const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
        return this.hmoService.fetchTransactions({ page, limit }, params);
    }

    @Get('/insurance-types')
    getHmoTypes(): Promise<HmoType[]> {
        return this.hmoService.getHmoTypes();
    }

    @Post('transactions/process')
    processTransaction(
        @Body() param,
        @Request() req,
    ) {
        return this.hmoService.processTransaction(param, req.user);
    }

    @Post('transactions/transfer')
    transferTransaction(
        @Body() param,
        @Request() req,
    ) {
        return this.hmoService.transferToPaypoint(param, req.user.username);
    }
}
