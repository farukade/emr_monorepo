import { Module } from '@nestjs/common';
import { SpecializationController } from './specialization.controller';
import { SpecializationService } from './specialization.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpecializationRepository } from './specialization.repository';

@Module({
	imports: [TypeOrmModule.forFeature([SpecializationRepository])],
	controllers: [SpecializationController],
	providers: [SpecializationService],
})
export class SpecializationModule {}
