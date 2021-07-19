import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DrugService } from './drug.service';
import { DrugController } from './drug.controller';
import { DrugRepository } from './drug.repository';

@Module({
    imports: [TypeOrmModule.forFeature([DrugRepository])],
    providers: [DrugService],
    controllers: [DrugController],
})
export class DrugModule {}
