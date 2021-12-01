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

    @Get('/rooms')
    migrateRooms(
        @Query() urlParams,
        @Request() request,
    ): Promise<any> {
        return this.migrationService.queueMigration('rooms');
    }

    @Get('/alert')
    migrateAlert(
        @Query() urlParams,
        @Request() request,
    ): Promise<any> {
        return this.migrationService.queueMigration('alert');
    }

    @Get('/in-patients')
    migrateInPatients(
        @Query() urlParams,
        @Request() request,
    ): Promise<any> {
        return this.migrationService.queueMigration('in-patients');
    }

    @Get('/observation')
    migrateObservation(
        @Query() urlParams,
        @Request() request,
    ): Promise<any> {
        return this.migrationService.queueMigration('observation');
    }

    @Get('/allergen')
    migrateAllergen(
        @Query() urlParams,
        @Request() request,
    ): Promise<any> {
        return this.migrationService.queueMigration('allergen');
    }

    @Get('/care-team')
    migrateCareTeam(
        @Query() urlParams,
        @Request() request,
    ): Promise<any> {
        return this.migrationService.queueMigration('care-team');
    }

    @Get('/encounter')
    migrateEncounter(
        @Query() urlParams,
        @Request() request,
    ): Promise<any> {
        return this.migrationService.queueMigration('encounter');
    }

    @Get('/call')
    callPatient(
        @Query() urlParams,
        @Request() request,
    ): Promise<any> {
        return this.migrationService.queueMigration('call');
    }
}
