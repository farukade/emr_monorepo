import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoggerRepository } from './logger.repository';
import { LogEntity } from './entities/logger.entity';

@Injectable()
export class LoggerService {
  constructor(
    @InjectRepository(LoggerRepository)
    private loggerRepository: LoggerRepository,
  ) {}

  async getFailedLogs(): Promise<LogEntity[]> {
    return await this.loggerRepository.find({ where: { status: 'failed' } });
  }
}
