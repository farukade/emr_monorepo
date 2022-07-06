import { Body, Controller, Get, Post, Query, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { AttendanceDepartmentDto } from './dto/attendance-department.dto';
import { DeviceDto } from './dto/device.dto';
import { DeviceUserDto } from './dto/user.dto';

@ApiTags('HR-Attendance')
@UseGuards(AuthGuard('jwt'))
@Controller('hr/attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) { }

  @Get()
  getAttendance(
    @Query() urlParams
  ) {
    return this.attendanceService.emrFilter(urlParams);
  }

  @Get('save')
  saveAttendance() {
    return this.attendanceService.saveAttendance();
  }

  @Get('create-user')
  createUser(
    @Query() urlParams
    ) {
    return this.attendanceService.createUser(urlParams);
  }

  @Get('users-live')
  getLiveUsers() {
    return this.attendanceService.getAllLiveUsers();
  }

  @Get('logs')
  getLiveLogs(
    @Query() urlParams
  ) {
    return this.attendanceService.getLiveLogs(urlParams);
  }

  @Post('device')
  addDevice(
    @Body() data: DeviceDto
  ) {
    return this.attendanceService.addDevice(data)
  }

  @Get('device')
  getDevice() {
    return this.attendanceService.getDevice();
  }

  @Get('bulk-create/users')
  addUsers() {
    return this.attendanceService.addUsers();
  };
}
