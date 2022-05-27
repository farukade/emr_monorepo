import {MigrationInterface, QueryRunner} from "typeorm";

export class PatientRequestItem1653651009001 implements MigrationInterface {
    name = 'PatientRequestItem1653651009001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_request_items" RENAME COLUMN "canSchedule" TO "can_schedule"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_request_items" RENAME COLUMN "can_schedule" TO "canSchedule"`);
    }

}
