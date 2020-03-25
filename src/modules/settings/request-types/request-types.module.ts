import { Module } from '@nestjs/common';
import { RequestTypesController } from './request-types.controller';
import { RequestTypesService } from './request-types.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestTypeRepository } from './request-type.repository';

@Module({
  imports: [TypeOrmModule.forFeature([RequestTypeRepository])],
  controllers: [RequestTypesController],
  providers: [RequestTypesService]
})
export class RequestTypesModule {}
