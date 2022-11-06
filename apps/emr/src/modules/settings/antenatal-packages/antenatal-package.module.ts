import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AntenatalPackageController } from './antenatal-package.controller';
import { AntenatalPackageService } from './antenatal-package.service';
import { AntenatalPackageRepository } from './antenatal-package.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AntenatalPackageRepository])],
  controllers: [AntenatalPackageController],
  providers: [AntenatalPackageService],
})
export class AntenatalPackageModule {}
