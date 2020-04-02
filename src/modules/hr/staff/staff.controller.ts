import { Controller, Post, Body, Patch, Param, Get, Delete, UsePipes, ValidationPipe, Query } from '@nestjs/common';
import { StaffDto } from './dto/staff.dto';
import { StaffDetails } from './entities/staff_details.entity';
import { StaffService } from './staff.service';

@Controller('hr/staffs')
export class StaffController {
    constructor( private staffService: StaffService) {}

    @Get()
    listStaffs() {
        return this.staffService.getStaffs();
    }

    @Get('find')
    findStaffDetails(
        @Query() param,
    ): Promise<StaffDetails[]> {
        return this.staffService.findStaffs(param);
    }

    @Post()
    @UsePipes(ValidationPipe)
    createNewStaff(@Body() staffDto: StaffDto): Promise<StaffDetails> {
        return this.staffService.addNewStaff(staffDto);
    }

    @Patch(':id/update')
    updateStaffDetails(
        @Param('id') id: string,
        @Body() staffDto: StaffDto,
    ): Promise <StaffDetails> {
        return this.staffService.updateStaffDetails(id, staffDto);
    }

    @Delete(':id')
    deleteStaff(
        @Param('id') id: string,
    ): Promise<void> {
        return this.staffService.deleteStaff(id);
    }
}
