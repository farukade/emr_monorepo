import { Controller, Get, Body, Post, Patch, Param, Delete, Query, UsePipes, ValidationPipe, Request } from '@nestjs/common';
import { LeavemgtService } from './leavemgt.service';
import { LeaveApplicationDto } from './dto/leave.application.dto';
import { LeaveApplication } from './entities/leave_application.entity';

@Controller('hr/leave-management')
export class LeavemgtController {
    constructor(private leaveService: LeavemgtService) {}

    @Get()
    getAllLeaves(
        @Query() urlParams,
    ): Promise<LeaveApplication[]> {
        return this.leaveService.listApplications(urlParams);
    }

    @Get('/excuse-duty')
    getExcuseDuty(
        @Query() urlParams,
    ): Promise<LeaveApplication[]> {
        return this.leaveService.listExcuseDuty(urlParams);
    }

    @Post()
    @UsePipes(ValidationPipe)
    createLeaveApplication(
        @Body() leaveApplicationDto: LeaveApplicationDto,
    ): Promise<LeaveApplication> {
        return this.leaveService.saveLeaveApplication(leaveApplicationDto);
    }

    @Patch(':id/update')
    @UsePipes(ValidationPipe)
    updateLeaveApplication(
        @Param('id') id: string,
        @Body() leaveApplicationDto: LeaveApplicationDto,
    ) {
        return this.leaveService.updateLeaveApplication(id, leaveApplicationDto);
    }

    @Get(':id/approve')
    approveLeaveApplication(@Param('id') id: string) {
        return this.leaveService.approveLeave(id);
    }

    @Get(':id/reject')
    rejectLeaveapplication(@Param('id') id: string) {
        return this.leaveService.rejectLeave(id);
    }

    @Delete(':id')
    deleteLeaveApplication(
        @Param('id') id: number,
        @Request() req,
    ) {
        console.log(req);
        return this.leaveService.deleteApplication(id, req?.user?.username);
    }
}
