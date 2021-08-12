import {MigrationInterface, QueryRunner} from "typeorm";

export class DbMigration1628605497018 implements MigrationInterface {
    name = 'DbMigration1628605497018'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admissions" ADD "start_discharge" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "admissions" ADD "start_discharge_date" text`);
        await queryRunner.query(`ALTER TABLE "admissions" ADD "start_discharge_by" text`);
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "date_discharged"`);
        await queryRunner.query(`ALTER TABLE "admissions" ADD "date_discharged" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "date_discharged"`);
        await queryRunner.query(`ALTER TABLE "admissions" ADD "date_discharged" character varying`);
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "start_discharge_by"`);
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "start_discharge_date"`);
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "start_discharge"`);
    }

}
