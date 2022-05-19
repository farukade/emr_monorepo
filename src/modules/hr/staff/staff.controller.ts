import { Controller, Post, Body, Patch, Param, Get, Delete, UsePipes, ValidationPipe, Query, Request, Put, UploadedFile, UseGuards } from '@nestjs/common';
import { StaffDto } from './dto/staff.dto';
import { StaffDetails } from './entities/staff_details.entity';
import { StaffService } from './staff.service';
import { AuthGuard } from '@nestjs/passport';
import { Pagination } from '../../../common/paginate/paginate.interface';

@UseGuards(AuthGuard('jwt'))
@Controller('hr/staffs')
export class StaffController {
	constructor(private staffService: StaffService) {}

	@Get('')
	listStaffs(@Query() urlParams, @Request() request): Promise<Pagination> {
		const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
		const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
		return this.staffService.getStaffs({ page, limit }, urlParams);
	}

	@Get('/find')
	findStaffDetails(@Query() param, @Request() request): Promise<StaffDetails[]> {
		const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 50;
		return this.staffService.findStaffs({ limit }, param);
	}

	@Post('')
	@UsePipes(ValidationPipe)
	createNewStaff(@Request() req, @Body() staffDto: StaffDto): Promise<StaffDetails> {
		return this.staffService.addNewStaff(staffDto, req.user.username);
	}

	@Patch(':id/enable')
	enableStaff(@Param('id') id: number, @Request() req) {
		return this.staffService.enableStaff(id, req.user.username);
	}

	@Post(':id/reset-password')
	resetPassword(@Param('id') id: number, @Request() req) {
		return this.staffService.resetPassword(id, req.user.username);
	}

	@Post(':id/salary')
	@UsePipes(ValidationPipe)
	updateStaffSalary(@Param('id') id: number, @Request() req, @Body() staffDto): Promise<StaffDetails> {
		return this.staffService.updateStaffSalary(id, staffDto, req.user.username);
	}

	@Put(':id')
	updateStaffDetails(@Param('id') id: number, @Body() staffDto: StaffDto, @Request() req): Promise<any> {
		return this.staffService.updateStaffDetails(id, staffDto, req.user.username);
	}

	@Post('set-consulting-room')
	setConsultingRoom(@Body() param) {
		return this.staffService.setConsultingRoom(param);
	}

	@Get('unset-room/:staffId')
	unSetConsultingRoom(@Param('staffId') staffId: string) {
		return this.staffService.unSetConsultingRoom(staffId);
	}

	@Delete(':id')
	deleteStaff(@Param('id') id: number, @Request() req) {
		return this.staffService.deleteStaff(id, req.user.username);
	}

	@Get('transactions')
	getStaff(@Query() urlParams) {
		return this.staffService.getStaff(urlParams);
	}
}
