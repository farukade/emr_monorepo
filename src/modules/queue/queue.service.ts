import { Injectable, Logger } from '@nestjs/common';
import Bull, { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @InjectQueue(process.env.QUEUE_NAME)
    private queue: Queue,
  ) {}

  async queueJob(type: string, data: any): Promise<Bull.Job<any>> {
    try {
      return await this.queue.add(type, data);
    } catch (error) {
      console.log(error);
      this.logger.error(`Error queueing task: ${type}`);
    }
  }
}
