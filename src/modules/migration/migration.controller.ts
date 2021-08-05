import { Controller, Get, Query, Request } from '@nestjs/common';
import { MigrationService } from './migration.service';

@Controller('migrations')
export class MigrationController {
    constructor(
        private migrationService: MigrationService,
    ) {}

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

    @Get('/staffs')
    migrateStaff(
        @Query() urlParams,
        @Request() request,
    ): Promise<any> {
        return this.migrationService.queueMigration('staffs');
    }

    @Get('/patients')
    migratePatients(
        @Query() urlParams,
        @Request() request,
    ): Promise<any> {
        return this.migrationService.queueMigration('patients');
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

    @Get('/lab')
    migrateLab(
        @Query() urlParams,
        @Request() request,
    ): Promise<any> {
        return this.migrationService.queueMigration('lab');
    }

    @Get('/store')
    migrateStore(
        @Query() urlParams,
        @Request() request,
    ): Promise<any> {
        return this.migrationService.queueMigration('store');
    }
}
