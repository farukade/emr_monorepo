import {MigrationInterface, QueryRunner} from "typeorm";

export class Patient1635744908442 implements MigrationInterface {
    name = 'Patient1635744908442'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patients" ADD "is_active" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "is_active"`);
    }

}
