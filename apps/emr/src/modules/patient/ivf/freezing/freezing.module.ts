import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmbFreezingController } from './freezing.controller';
import { EmbFreezingRepository } from './freezing.repository';
import { EmbFreezingService } from './freezing.service';
import { SpermOocyteDonorRepository } from './repositories/donor.repository';
import { OocyteRepository } from './repositories/oocyte.repository';
import { SpermRepository } from './repositories/sperm.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([SpermRepository, SpermOocyteDonorRepository, OocyteRepository, EmbFreezingRepository]),
  ],
  controllers: [EmbFreezingController],
  providers: [EmbFreezingService],
})
export class EmbFreezingModule {}
