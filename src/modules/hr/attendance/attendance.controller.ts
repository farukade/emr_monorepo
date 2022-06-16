import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AttendanceService } from "./attendance.service";
import { DeviceUserDto } from "./dto/user.dto";


@UseGuards(AuthGuard('jwt'))
@Controller('attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Get()
  getAttendance(
    @Query() urlParams
  ) {
    return this.attendanceService.emrFilter(urlParams);
  };

  @Get('get')
  saveAttendance() {
    return this.attendanceService.saveAttendance();
  }

  @Post('create-user')
  createUser(
    @Body() data: DeviceUserDto
  ) {
    return this.attendanceService.createUser(data);
  }

  @Get('users')
  getUsers() {
    return this.attendanceService.getAllUsers();
  }

  @Get('logs')
  getLiveLogs() {
    return this.attendanceService.getLiveLogs();
  }
};

