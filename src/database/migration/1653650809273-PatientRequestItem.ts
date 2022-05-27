import {MigrationInterface, QueryRunner} from "typeorm";

export class PatientRequestItem1653650809273 implements MigrationInterface {
    name = 'PatientRequestItem1653650809273'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_request_items" ADD "canSchedule" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_request_items" DROP COLUMN "canSchedule"`);
    }

}
