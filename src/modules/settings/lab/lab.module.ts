import { Module } from '@nestjs/common';
import { LabController } from './lab.controller';
import { LabService } from './lab.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabTestCategoryRepository } from './lab.category.repository';
import { LabTestRepository } from './lab.test.repository';
import { ParameterRepository } from './parameter.repository';

@Module({
  imports: [TypeOrmModule.forFeature([LabTestCategoryRepository, LabTestRepository, ParameterRepository])],
  controllers: [LabController],
  providers: [LabService],
})
export class LabModule {}
