import { Controller, Get, Post, Patch, UsePipes, ValidationPipe, Body, Param, Delete, Request, Query, UseGuards} from '@nestjs/common';
import { ServicesService } from './services.service';
import { Service } from '../entities/service.entity';
import { ServiceCategory } from '../entities/service_category.entity';
import { ServiceDto } from './dto/service.dto';
import { ServiceCategoryDto } from './dto/service.category.dto';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('services')
export class ServicesController {
    constructor(private servicesService: ServicesService) {
    }

    @Get()
    getServices(
        @Request() request,
        @Query() urlParams,
    ): Promise<Pagination> {
        const limit = request.query.hasOwnProperty('limit') ? request.query.limit : 30;
        const page = request.query.hasOwnProperty('page') ? request.query.page : 1;

        return this.servicesService.getAllServices({ page, limit }, urlParams);
    }

    // get services by category id
    @Get('/category/:id')
    getServicesByCategory(
        @Param('id') id: number,
    ): Promise<Service[]> {
        return this.servicesService.getServicesByCategory(id);
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
    deleteService(
        @Param('id') id: number,
        @Request() req,
    ): Promise<any> {
        return this.servicesService.deleteService(id, req.user.username);
    }

    // @Post('/upload-services')
    // @UseInterceptors(FileInterceptor('file', {
    //     storage: diskStorage({
    //         filename: (req, file, cb) => {
    //             const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
    //             return cb(null, `${randomName}${extname(file.originalname)}`);
    //         },
    //     }),
    // }))
    // uploadServices(
    //     @UploadedFile() file,
    //     @Body() uploadDto: ServicesUploadRateDto,
    //     @Request() req,
    // ) {
    //     return this.servicesService.doUploadServices(uploadDto, file, req.user.username);
    // }

    // categories
    @Get('/categories')
    getCategories(): Promise<ServiceCategory[]> {
        return this.servicesService.getServicesCategory();
    }

    @Get('/categories/:slug')
    getCategoryById(
        @Param('name') name: string,
    ): Promise<ServiceCategory> {
        return this.servicesService.getServicesCategoryBySlug(name);
    }

    @Post('/categories')
    @UsePipes(ValidationPipe)
    createServiceCategory(@Body() serviceCategoryDto: ServiceCategoryDto): Promise<ServiceCategory> {
        return this.servicesService.createServiceCategory(serviceCategoryDto);
    }

    @Patch('/categories/:id')
    @UsePipes(ValidationPipe)
    updateCategory(
        @Param('id') id: number,
        @Body() serviceCategoryDto: ServiceCategoryDto,
    ): Promise<ServiceCategory> {
        return this.servicesService.updateServiceCategory(id, serviceCategoryDto);
    }

    @Delete('categories/:id')
    deleteServiceCategory(
        @Param('id') id: number,
        @Request() req,
    ): Promise<any> {
        return this.servicesService.deleteServiceCategory(id, req.user.username);
    }
}
