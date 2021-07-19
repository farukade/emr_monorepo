import { Controller, Get, Query, Request } from '@nestjs/common';
import { MigrationService } from './migration.service';

@Controller('migrations')
export class MigrationController {
    constructor(
        private migrationService: MigrationService,
    ) {}

    @Get('/patients')
    migratePatients(
        @Query() urlParams,
        @Request() request,
    ): Promise<any> {
        return this.migrationService.queueMigration('patients');
    }

    @Get('/diagnosis')
    migrateDiagnosis(
        @Query() urlParams,
        @Request() request,
    ): Promise<any> {
        return this.migrationService.queueMigration('diagnosis');
    }

    @Get('/hmo')
    migrateHmo(
        @Query() urlParams,
        @Request() request,
    ): Promise<any> {
        return this.migrationService.queueMigration('hmo');
    }

    @Get('/services')
    migrateServices(
        @Query() urlParams,
        @Request() request,
    ): Promise<any> {
        return this.migrationService.queueMigration('services');
    }

    @Get('/drugs')
    migrateDrugs(
        @Query() urlParams,
        @Request() request,
    ): Promise<any> {
        return this.migrationService.queueMigration('drugs');
    }
}
