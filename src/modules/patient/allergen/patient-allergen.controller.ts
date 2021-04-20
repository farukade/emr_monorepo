import { Controller, Post, Body, Param, Request, Delete, UseGuards, Get, Query, UsePipes, ValidationPipe, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PatientAllergenService } from './patient-allergen.service';
import { PatientAllergyDto } from '../dto/patient.allergy.dto';
import { PatientAllergen } from '../entities/patient_allergens.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('patient-allergens')
export class PatientAllergenController {
    constructor(
        private allergenService: PatientAllergenService,
    ) {}

    @Get('')
    getAllergies(
        @Query() urlParams,
        @Request() request,
    ): Promise<any> {
        const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
        const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
        return this.allergenService.getAllergies({page, limit}, urlParams);
    }

    @Post('save')
    @UsePipes(ValidationPipe)
    saveAllergies(
        @Body() param: PatientAllergyDto,
        @Request() req,
    ) {
        return this.allergenService.doSaveAllergies(param, req.user.username);
    }

    @Patch(':id/update')
    @UsePipes(ValidationPipe)
    updateAllergy(
        @Param('id') id: number,
        @Body() param: PatientAllergyDto,
        @Request() req,
    ) {
        return this.allergenService.doUpdateAllergy(id, param, req.user.username);
    }

    @Delete('/:id')
    deletePackage(
        @Param('id') id: number,
        @Request() req,
    ): Promise<PatientAllergen> {
        return this.allergenService.deleteAllergen(id, req.user.username);
    }
}
