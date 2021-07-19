import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DrugGenericService } from './generic.service';
import { DrugGenericController } from './generic.controller';
import { DrugGenericRepository } from './generic.repository';

@Module({
    imports: [TypeOrmModule.forFeature([DrugGenericRepository])],
    providers: [DrugGenericService],
    controllers: [DrugGenericController],
})
export class GenericModule {}
