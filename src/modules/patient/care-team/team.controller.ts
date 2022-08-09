import {
  Controller,
  Get,
  Request,
  UseGuards,
  Query,
  Body,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CareTeamService } from './team.service';
import { AuthGuard } from '@nestjs/passport';
import { StaffDetails } from '../../hr/staff/entities/staff_details.entity';
import { CareTeamDto } from './dto/team.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('care-teams')
export class CareTeamController {
  constructor(private readonly careTeamService: CareTeamService) {}

  @Get('')
  getMembers(@Query() urlParams, @Request() request): Promise<any> {
    const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
    const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
    return this.careTeamService.getMembers({ page, limit }, urlParams);
  }

  @Post('')
  @UsePipes(ValidationPipe)
  saveTeamMembers(@Request() req, @Body() careTeamDto: CareTeamDto): Promise<StaffDetails> {
    return this.careTeamService.saveTeamMembers(careTeamDto, req.user.username);
  }
}
