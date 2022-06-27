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
  saveAttendance(
    @Query() urlParams,
    @Res() res
  ) {
    return this.attendanceService.saveAttendance(urlParams, res);
  }

  @Post('create-user')
  createUser(
    @Body() data: DeviceUserDto
    ) {
    return this.attendanceService.createUser(data);
  }

  @Get('users-live')
  getLiveUsers(
    @Query() urlParams
  ) {
    return this.attendanceService.getAllLiveUsers(urlParams);
  }

  @Get('users')
  getUsers(
    @Query() urlParams
  ) {
    return this.attendanceService.getAllUsers(urlParams);
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

  @Post('department')
  addDepartment(
    @Body() data: AttendanceDepartmentDto
  ) {
    return this.attendanceService.addDepartment(data)
  }

  @Get('device')
  getDevice(
    @Query() urlParams
  ) {
    return this.attendanceService.getDevice(urlParams);
  }

  @Post('bulk-create/users')
  bulkCreateUsers(
    @Body() data
  ) {
    return this.attendanceService.bulkCreateUsers(data);
  }
}
