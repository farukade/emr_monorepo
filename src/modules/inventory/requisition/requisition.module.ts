import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequisitionService } from './requisition.service';
import { RequisitionRepository } from './requisition.repository';
import { RequisitionController } from './requisition.controller';

@Module({
    imports: [TypeOrmModule.forFeature([RequisitionRepository])],
    providers: [RequisitionService],
    controllers: [RequisitionController],
})
export class RequisitionModule {}
