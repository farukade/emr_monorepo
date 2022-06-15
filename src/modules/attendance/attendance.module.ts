import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AttendanceController } from "./attendance.controller";
import { AttendanceRepository } from "./attendance.repository";
import { AttendanceService } from "./attendance.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([AttendanceRepository])
    ],
    providers: [AttendanceService],
    controllers: [AttendanceController]
})
export class AttendanceModule { }