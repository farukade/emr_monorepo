import { EntityRepository, Repository } from "typeorm";
import { Attendance } from "./entities/attendance.entity";

@EntityRepository(Attendance)
export class AttendanceRepository extends Repository<Attendance> {
    
}