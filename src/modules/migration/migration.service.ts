import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class MigrationService {
    private readonly logger = new Logger(this.constructor.name);

    constructor(
        @InjectQueue(process.env.MIGRATION_QUEUE_NAME)
        private migrationQueue: Queue,
    ) {
    }

    async queueMigration(category: string): Promise<boolean> {
        try {
            await this.migrationQueue.add(category);
            return true;
        } catch (error) {
            console.log(error);
            this.logger.error(`Error queueing ${category} migration`);
            return false;
        }
    }
}
