import { Controller, Get, Post, Patch, UsePipes, ValidationPipe, Body, Param, Delete } from '@nestjs/common';
import { ServicesService } from './services.service';
import { Service } from '../entities/service.entity';
import { ServiceCategory } from '../entities/Service_category.entity';
import { ServiceDto } from './dto/Service.dto';
import { ServiceCategoryDto } from './dto/Service.category.dto';

@Controller('services')
export class ServicesController {
    constructor(private servicesService: ServicesService) {}

    @Get()
    getServices(): Promise<Service[]> {
        return this.servicesService.getAllServices();
    }

    @Post()
    @UsePipes(ValidationPipe)
    createService(@Body() serviceDto: ServiceDto): Promise<Service> {
        return this.servicesService.createService(serviceDto);
    }

    @Patch('/:id/update')
    @UsePipes(ValidationPipe)
    updateService(
        @Param('id') id: string,
        @Body() serviceDto: ServiceDto,
    ): Promise<Service> {
        return this.servicesService.updateService(id, serviceDto);
    }

    @Delete('/:id')
    deleteService(@Param('id') id: string): Promise<void> {
        return this.servicesService.deleteService(id);
    }

    @Get('/categories')
    getCategories(): Promise<ServiceCategory[]> {
        return this.servicesService.getServicesCategory();
    }

    @Post('/categories')
    @UsePipes(ValidationPipe)
    createServiceCategory(@Body() serviceCategoryDto: ServiceCategoryDto): Promise<ServiceCategory> {
        return this.servicesService.createServiceCategory(serviceCategoryDto);
    }

    @Patch('categories/:id/update')
    @UsePipes(ValidationPipe)
    updateCategory(
        @Param('id') id: string,
        @Body() serviceCategoryDto: ServiceCategoryDto,
    ): Promise<ServiceCategory> {
        return this.servicesService.updateServiceCategory(id, serviceCategoryDto);
    }

    @Delete('categories/:id')
    deleteServiceCategory(@Param('id') id: string): Promise<void> {
        return this.servicesService.deleteServiceCategory(id);
    }
}
