import { Module } from '@nestjs/common';
import { LeaveCategoryController } from './leave-category.controller';
import { LeaveCategoryService } from './leave-category.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveCategoryRepository } from './leave.category.repository';

@Module({
  imports: [TypeOrmModule.forFeature([LeaveCategoryRepository])],
  controllers: [LeaveCategoryController],
  providers: [LeaveCategoryService],
})
export class LeaveCategoryModule {}
