import {
  Controller,
  Get,
  Post,
  Patch,
  UsePipes,
  ValidationPipe,
  Body,
  Param,
  Delete,
  Request,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { Service } from '../entities/service.entity';
import { ServiceDto } from './dto/service.dto';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { AuthGuard } from '@nestjs/passport';
import { ServiceCost } from '../entities/service_cost.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';

@UseGuards(AuthGuard('jwt'))
@Controller('services')
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  @Get('')
  getServices(@Request() request, @Query() urlParams): Promise<Pagination> {
    const limit = request.query.hasOwnProperty('limit') ? request.query.limit : 30;
    const page = request.query.hasOwnProperty('page') ? request.query.page : 1;

    return this.servicesService.getAllServices({ page, limit }, urlParams);
  }

  @Get('/:slug')
  getServicesByCategory(@Param('slug') slug: string, @Request() request, @Query() urlParams) {
    const limit = request.query.hasOwnProperty('limit') ? request.query.limit : 50;
    const page = request.query.hasOwnProperty('page') ? request.query.page : 1;

    return this.servicesService.getServicesByCategory(slug, { page, limit }, urlParams);
  }

  @Get('/download/:category')
  downloadServices(@Query() urlParams, @Param('category') id: string): Promise<any> {
    return this.servicesService.download(id, urlParams);
  }

  @Post('/upload/:category')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  uploadServices(@Body() body, @UploadedFile() file, @Param('category') id: number): Promise<any> {
    return this.servicesService.upload(id, file, body);
  }

  @Get('/private/:code')
  getPrivateServiceByCode(@Param('code') code: string): Promise<ServiceCost> {
    return this.servicesService.getPrivateServiceByCode(code);
  }

  @Post('')
  @UsePipes(ValidationPipe)
  createService(@Body() serviceDto: ServiceDto): Promise<Service> {
    return this.servicesService.createService(serviceDto);
  }

  @Patch('/:id')
  @UsePipes(ValidationPipe)
  updateService(@Param('id') id: string, @Body() serviceDto: ServiceDto): Promise<any> {
    return this.servicesService.updateService(id, serviceDto);
  }

  @Delete('/:id')
  deleteService(@Param('id') id: number, @Request() req): Promise<any> {
    return this.servicesService.deleteService(id, req.user.username);
  }

  @Get('cost/print')
  getServiceById(
    @Query() urlParams,
    @Request() req
  ) {
    return this.servicesService.printServices(urlParams, req.user);
  }
}
