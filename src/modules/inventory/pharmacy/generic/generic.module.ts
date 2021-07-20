import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DrugGenericService } from './generic.service';
import { DrugGenericController } from './generic.controller';
import { DrugGenericRepository } from './generic.repository';
import { DrugCategoryRepository } from '../drug/drug_category.repository';

@Module({
    imports: [TypeOrmModule.forFeature([DrugGenericRepository, DrugCategoryRepository])],
    providers: [DrugGenericService],
    controllers: [DrugGenericController],
})
export class GenericModule {}
