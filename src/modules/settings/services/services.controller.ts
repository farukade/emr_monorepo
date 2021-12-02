import { Controller, Get, Post, Patch, UsePipes, ValidationPipe, Body, Param, Delete, Request, Query, UseGuards } from '@nestjs/common';
import { ServicesService } from './services.service';
import { Service } from '../entities/service.entity';
import { ServiceDto } from './dto/service.dto';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { AuthGuard } from '@nestjs/passport';
import { ServiceCost } from '../entities/service_cost.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('services')
export class ServicesController {
    constructor(private servicesService: ServicesService) {
    }

    @Get('')
    getServices(
        @Request() request,
        @Query() urlParams,
    ): Promise<Pagination> {
        const limit = request.query.hasOwnProperty('limit') ? request.query.limit : 30;
        const page = request.query.hasOwnProperty('page') ? request.query.page : 1;

        return this.servicesService.getAllServices({ page, limit }, urlParams);
    }

    @Get('/:slug')
    getServicesByCategory(
        @Param('slug') slug: string,
        @Request() request,
        @Query() urlParams,
    ) {
        const limit = request.query.hasOwnProperty('limit') ? request.query.limit : 50;
        const page = request.query.hasOwnProperty('page') ? request.query.page : 1;

        return this.servicesService.getServicesByCategory(slug, { page, limit }, urlParams);
    }

    @Get('/download/:category')
    downloadServices(
        @Query() urlParams,
        @Param('category') category: string,
    ): Promise<any> {
        return this.servicesService.download(category, urlParams);
    }

    @Get('/private/:code')
    getPrivateServiceByCode(
        @Param('code') code: string,
        @Query() urlParams,
    ): Promise<ServiceCost> {
        return this.servicesService.getPrivateServiceByCode(code);
    }

    @Post('')
    @UsePipes(ValidationPipe)
    createService(@Body() serviceDto: ServiceDto): Promise<Service> {
        return this.servicesService.createService(serviceDto);
    }

    @Patch('/:id')
    @UsePipes(ValidationPipe)
    updateService(
        @Param('id') id: string,
        @Body() serviceDto: ServiceDto,
    ): Promise<any> {
        return this.servicesService.updateService(id, serviceDto);
    }

    @Delete('/:id')
    deleteService(
        @Param('id') id: number,
        @Request() req,
    ): Promise<any> {
        return this.servicesService.deleteService(id, req.user.username);
    }
}
