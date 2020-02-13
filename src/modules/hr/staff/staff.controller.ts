import { Controller, Post, Body, Patch, Param, Get, Delete } from '@nestjs/common';
import { StaffDto } from '../dto/staff.dto';
import { StaffDetails } from './staff_details.entity';
import { StaffService } from './staff.service';

@Controller('hr/staffs')
export class StaffController {
    constructor( private staffService: StaffService) {}

    @Get()
    listStaffs() {
        return this.staffService.getStaffs();
    }

    @Post()
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

    @Delete()
    deleteStaff(
        @Param('id') id: string,
    ): Promise<void> {
        return this.staffService.deleteStaff(id);
    }
}
