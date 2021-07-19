import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequisitionRepository } from './requisition.repository';
import { RequisitionController } from './requisition.controller';
import { RequisitionService } from './requisition.service';

@Module({
    imports: [TypeOrmModule.forFeature([RequisitionRepository])],
    providers: [RequisitionService],
    controllers: [RequisitionController],
})
export class RequisitionModule {}
