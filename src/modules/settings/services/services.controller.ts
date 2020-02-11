import { Controller, Get, Post, Patch, UsePipes, ValidationPipe, Body, Param, Delete, UseInterceptors, UploadedFile, Header, Res } from '@nestjs/common';
import { ServicesService } from './services.service';
import { Service } from '../entities/service.entity';
import { ServiceCategory } from '../entities/Service_category.entity';
import { ServiceDto } from './dto/Service.dto';
import { ServiceCategoryDto } from './dto/Service.category.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join, resolve } from 'path';

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

    @Post('/upload-services')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            },
        }),
    }))
    uploadServices(
        @UploadedFile() file) {
        return this.servicesService.doUploadServices(file);
    }

    @Get('download-services')
    @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    @Header('Content-Disposition', 'attachment; filename=services.csv')
    async downloadServices(
        @Res() res) {
        const message = await this.servicesService.downloadServices();
        if (message === 'Completed') {
            res.sendFile(join(__dirname, '../../../../') + '/services.csv');
        }
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
