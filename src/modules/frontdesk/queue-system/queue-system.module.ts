import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueSystemRepository } from './queue-system.repository';
import { QueueSystemService } from './queue-system.service';
import { QueueSystemController } from './queue-system.controller';
import {DepartmentRepository} from "../../settings/departments/department.repository";
import {AppointmentRepository} from "../appointment/appointment.repository";
import {AppGateway} from "../../../app.gateway";

@Module({
    imports: [TypeOrmModule.forFeature([AppointmentRepository, QueueSystemRepository, DepartmentRepository])],
    providers: [AppGateway, QueueSystemService],
    controllers: [QueueSystemController],
})
export class QueueSystemModule {}
