import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueSystemRepository } from './queue-system.repository';
import { QueueSystemService } from './queue-system.service';
import { QueueSystemController } from './queue-system.controller';

@Module({
    imports: [TypeOrmModule.forFeature([QueueSystemRepository])],
    providers: [QueueSystemService],
    controllers: [QueueSystemController],
})
export class QueueSystemModule {}
