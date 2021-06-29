import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { LoggerController } from './logger.controller';
import { LoggerService } from './logger.service';
import { LoggerRepository } from './logger.repository';

@Module({
    imports: [TypeOrmModule.forFeature([LoggerRepository])],
    providers: [LoggerService],
    controllers: [LoggerController],
})
export class LoggerModule {
}
