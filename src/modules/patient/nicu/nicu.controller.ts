import { Controller, Get, Post, Body, Put, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { NicuService } from './nicu.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateNicuDto } from './dto/create-nicu.dto';
import { UpdateNicuDto } from './dto/update-nicu.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('nicu')
export class NicuController {
    constructor(private readonly nicuService: NicuService) {
    }

    @Post()
    create(@Body() createNicuDto: CreateNicuDto, @Request() req) {
        return this.nicuService.createNicu(createNicuDto, req.user.userId);
    }

    @Get()
    findAll() {
        return this.nicuService.getAllNicu();
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.nicuService.getNicu(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateNicuDto: UpdateNicuDto) {
        return this.nicuService.updateNicu(id, updateNicuDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.nicuService.removeNicu(id);
    }
}
