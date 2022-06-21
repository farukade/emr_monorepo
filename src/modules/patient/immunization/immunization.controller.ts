import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ImmunizationService } from './immunization.service';
import { Immunization } from './entities/immunization.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('patient/immunization')
export class ImmunizationController {
  constructor(private immunizationService: ImmunizationService) {}

  @Get(':id')
  getImmunizations(@Param('id') id: string): Promise<Immunization[]> {
    return this.immunizationService.fetch(id);
  }

  @Post('enroll')
  enrollImmunization(@Body() param, @Request() req) {
    return this.immunizationService.enroll(param, req.user.username);
  }
}
