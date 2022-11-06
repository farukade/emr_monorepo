import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NicuAccommodationRepository } from './accommodation.repository';
import { NicuAccommodationController } from './accommodation.controller';
import { NicuAccommodationService } from './accommodation.service';

@Module({
  imports: [TypeOrmModule.forFeature([NicuAccommodationRepository])],
  controllers: [NicuAccommodationController],
  providers: [NicuAccommodationService],
})
export class NicuAccommodationModule {}
