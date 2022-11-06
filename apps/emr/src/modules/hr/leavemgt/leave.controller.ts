import {
  Controller,
  Get,
  Body,
  Post,
  Patch,
  Param,
  Delete,
  Query,
  UsePipes,
  ValidationPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import { LeaveService } from './leave.service';
import { LeaveDto } from './dto/leave.dto';
import { Leave } from './entities/leave.entity';
import { AuthGuard } from '@nestjs/passport';
import { Pagination } from '../../../common/paginate/paginate.interface';

@UseGuards(AuthGuard('jwt'))
@Controller('hr/leave-management')
export class LeaveController {
  constructor(private leaveService: LeaveService) {}

  @Get()
  getAllLeaves(@Query() urlParams, @Request() request): Promise<Pagination> {
    const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
    const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
    return this.leaveService.listApplications({ page, limit }, urlParams);
  }

  @Post()
  @UsePipes(ValidationPipe)
  requestLeave(@Body() leaveDto: LeaveDto, @Request() req): Promise<Leave> {
    return this.leaveService.requestLeave(leaveDto, req.user.username);
  }

  @Patch(':id')
  @UsePipes(ValidationPipe)
  updateLeaveApplication(@Param('id') id: string, @Body() leaveDto: LeaveDto, @Request() req) {
    return this.leaveService.updateLeaveApplication(id, leaveDto, req.user.username);
  }

  @Post(':id/approve')
  approveLeaveApplication(@Param('id') id: string, @Request() req) {
    return this.leaveService.approveLeave(id, req.user.username);
  }

  @Post(':id/reject')
  rejectLeaveApplication(@Param('id') id: string, @Body() param, @Request() req) {
    return this.leaveService.rejectLeave(id, param, req.user.username);
  }

  @Delete(':id')
  deleteLeaveApplication(@Param('id') id: number, @Request() req) {
    return this.leaveService.deleteApplication(id, req.user.username);
  }
}
