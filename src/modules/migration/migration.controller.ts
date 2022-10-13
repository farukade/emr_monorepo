import { Controller, Get, Param } from '@nestjs/common';
import { MigrationService } from './migration.service';

@Controller('migrations')
export class MigrationController {
  constructor(private migrationService: MigrationService) {}

  @Get('/diagnosis')
  migrateDiagnosis(): Promise<any> {
    return this.migrationService.queueMigration('diagnosis');
  }

  @Get('/hmo')
  migrateHmo(): Promise<any> {
    return this.migrationService.queueMigration('hmo');
  }

  @Get('/staffs')
  migrateStaff(): Promise<any> {
    return this.migrationService.queueMigration('staffs');
  }

  @Get('/patients')
  migratePatients(): Promise<any> {
    return this.migrationService.queueMigration('patients');
  }

  @Get('/services')
  migrateServices(): Promise<any> {
    return this.migrationService.queueMigration('services');
  }

  @Get('/drugs')
  migrateDrugs(): Promise<any> {
    return this.migrationService.queueMigration('drugs');
  }

  @Get('/lab')
  migrateLab(): Promise<any> {
    return this.migrationService.queueMigration('lab');
  }

  @Get('/store')
  migrateStore(): Promise<any> {
    return this.migrationService.queueMigration('store');
  }

  @Get('/rooms')
  migrateRooms(): Promise<any> {
    return this.migrationService.queueMigration('rooms');
  }

  @Get('/alert')
  migrateAlert(): Promise<any> {
    return this.migrationService.queueMigration('alert');
  }

  @Get('/in-patients')
  migrateInPatients(): Promise<any> {
    return this.migrationService.queueMigration('in-patients');
  }

  @Get('/observation')
  migrateObservation(): Promise<any> {
    return this.migrationService.queueMigration('observation');
  }

  @Get('/allergen')
  migrateAllergen(): Promise<any> {
    return this.migrationService.queueMigration('allergen');
  }

  @Get('/care-team')
  migrateCareTeam(): Promise<any> {
    return this.migrationService.queueMigration('care-team');
  }

  @Get('/encounter')
  migrateEncounter(): Promise<any> {
    return this.migrationService.queueMigration('encounter');
  }

  @Get('/call')
  callPatient(): Promise<any> {
    return this.migrationService.queueMigration('call');
  }

  @Get('/fix-inpatients')
  fixInPatients(): Promise<any> {
    return this.migrationService.queueMigration('fix-inpatients');
  }

  @Get('/fix-nicu')
  fixNicu(): Promise<any> {
    return this.migrationService.queueMigration('fix-nicu');
  }

  @Get('/fix-procedure')
  fixProcedure(): Promise<any> {
    return this.migrationService.queueMigration('fix-procedure');
  }

  @Get('/del-lab')
  fixDelLabs(): Promise<any> {
    return this.migrationService.queueMigration('fix-deleted-labs');
  }

  @Get('fix-fluid/:id')
  fixFluid(@Param('id') id: number): Promise<any> {
    return this.migrationService.queueMigration('fix-fluid', id);
  }

  @Get('/fix-tasks')
  fixTasks(): Promise<any> {
    return this.migrationService.queueMigration('fix-tasks');
  }

  @Get('/fix-nicu-transactions')
  fixNicuTransactions(): Promise<any> {
    return this.migrationService.queueMigration('fix-nicu-transactions');
  }

  @Get('/fix-permissions')
  fixPermissions(): Promise<any> {
    return this.migrationService.queueMigration('fix-permissions');
  }

  @Get('/fix-appointments')
  fixAppointments(): Promise<any> {
    return this.migrationService.queueMigration('fix-appointments');
  }

  @Get('/fix-enrollments')
  fixEnrollments(): Promise<any> {
    return this.migrationService.queueMigration('fix-enrollments');
  }

  @Get('/fix-services')
  fixServices(): Promise<any> {
    return this.migrationService.queueMigration('fix-services');
  }

  @Get('/fix-docs')
  fixDocs(): Promise<any> {
    return this.migrationService.queueMigration('fix-docs');
  }

  @Get('/test')
  test(): Promise<any> {
    return this.migrationService.queueMigration('test');
  }
}
