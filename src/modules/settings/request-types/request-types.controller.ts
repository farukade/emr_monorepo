import { Controller, Get, Post, UsePipes, ValidationPipe, Body, Patch, Param, Delete } from '@nestjs/common';
import { RequestTypesService } from './request-types.service';
import { RequestType } from '../entities/request-type.entity';
import { RequestTypeDto } from './dto/request-type.dto';

@Controller('request-types')
export class RequestTypesController {
    constructor(private requestTypeService: RequestTypesService) {}

    @Get()
    getRequestType(): Promise<RequestType[]> {
        return this.requestTypeService.getRequestTypes();
    }

    @Post()
    @UsePipes(ValidationPipe)
    createRequestType(@Body() requestTypeDto: RequestTypeDto): Promise<RequestType> {
        return this.requestTypeService.createRequestType(requestTypeDto);
    }

    @Patch('/:id/update')
    @UsePipes(ValidationPipe)
    updateRequestType(
        @Param('id') id: string,
        @Body() requestTypeDto: RequestTypeDto,
    ): Promise<RequestType> {
        return this.requestTypeService.updateRequestType(id, requestTypeDto);
    }

    @Delete('/:id')
    deleteRequestType(@Param('id') id: string): Promise<void> {
        return this.requestTypeService.deleteRequestType(id);
    }
}
