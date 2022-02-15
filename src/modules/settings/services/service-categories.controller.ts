import { Controller, Get, Post, Patch, UsePipes, ValidationPipe, Body, Param, Delete, Request, Query, UseGuards} from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServiceCategory } from '../entities/service_category.entity';
import { ServiceCategoryDto } from './dto/service.category.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('service-categories')
export class ServicesCategoryController {
    constructor(private servicesService: ServicesService) {
    }

    @Get('')
    getCategories(
      @Query() urlParams,
    ): Promise<ServiceCategory[]> {
        return this.servicesService.getServicesCategory(urlParams);
    }

    @Get('/:slug')
    getServicesCategoryBySlug(
        @Param('slug') slug: string,
    ): Promise<ServiceCategory> {
        return this.servicesService.getServicesCategoryBySlug(slug);
    }

    @Post('/')
    @UsePipes(ValidationPipe)
    createServiceCategory(@Body() serviceCategoryDto: ServiceCategoryDto): Promise<ServiceCategory> {
        return this.servicesService.createServiceCategory(serviceCategoryDto);
    }

    @Patch('/:id')
    @UsePipes(ValidationPipe)
    updateCategory(
        @Param('id') id: number,
        @Body() serviceCategoryDto: ServiceCategoryDto,
    ): Promise<ServiceCategory> {
        return this.servicesService.updateServiceCategory(id, serviceCategoryDto);
    }

    @Delete('/:id')
    deleteServiceCategory(
        @Param('id') id: number,
        @Request() req,
    ): Promise<any> {
        return this.servicesService.deleteServiceCategory(id, req.user.username);
    }
}
