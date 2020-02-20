import { Controller, Get, Post, UsePipes, ValidationPipe, Body, Patch, Param, Delete } from '@nestjs/common';
import { SpecializationService } from './specialization.service';
import { Specialization } from '../entities/specialization.entity';
import { SpecializationDto } from './dto/specialization.dto';

@Controller('specializations')
export class SpecializationController {
    constructor(private specializationService: SpecializationService) {}

    @Get()
    getSpecialization(): Promise<Specialization[]> {
        return this.specializationService.getSpecializations();
    }

    @Post()
    @UsePipes(ValidationPipe)
    createSpecialization(@Body() specializationDto: SpecializationDto): Promise<Specialization> {
        return this.specializationService.createSpecialization(specializationDto);
    }

    @Patch('/:id/update')
    @UsePipes(ValidationPipe)
    updateSpecialization(
        @Param('id') id: string,
        @Body() specializationDto: SpecializationDto,
    ): Promise<Specialization> {
        return this.specializationService.updateSpecialization(id, specializationDto);
    }

    @Delete('/:id')
    deleteSpecialization(@Param('id') id: string): Promise<void> {
        return this.specializationService.deleteSpecialization(id);
    }
}
