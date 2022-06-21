import { Controller, Get } from '@nestjs/common';
import { LogEntity } from './entities/logger.entity';
import { LoggerService } from './logger.service';

@Controller('logs')
export class LoggerController {
  constructor(private loggerService: LoggerService) {}

  @Get('')
  getFailedLogs(): Promise<LogEntity[]> {
    return this.loggerService.getFailedLogs();
  }
}
