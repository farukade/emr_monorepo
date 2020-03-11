import { Module } from '@nestjs/common';
import { DiagnosisController } from './diagnosis.controller';
import { DiagnosisService } from './diagnosis.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiagnosisRepository } from './diagnosis.repository';

@Module({
  imports: [TypeOrmModule.forFeature([DiagnosisRepository])],
  controllers: [DiagnosisController],
  providers: [DiagnosisService],
})
export class DiagnosisModule {}
