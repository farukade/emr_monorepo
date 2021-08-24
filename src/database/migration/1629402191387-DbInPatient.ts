import {MigrationInterface, QueryRunner} from "typeorm";

export class DbInPatient1629402191387 implements MigrationInterface {
    name = 'DbInPatient1629402191387'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "reason"`);
        await queryRunner.query(`ALTER TABLE "admissions" ADD "reason" text`);
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "start_discharge_date"`);
        await queryRunner.query(`ALTER TABLE "admissions" ADD "start_discharge_date" character varying`);
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "start_discharge_by"`);
        await queryRunner.query(`ALTER TABLE "admissions" ADD "start_discharge_by" character varying`);
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "date_discharged"`);
        await queryRunner.query(`ALTER TABLE "admissions" ADD "date_discharged" character varying`);
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "discharge_note"`);
        await queryRunner.query(`ALTER TABLE "admissions" ADD "discharge_note" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "discharge_note"`);
        await queryRunner.query(`ALTER TABLE "admissions" ADD "discharge_note" character varying`);
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "date_discharged"`);
        await queryRunner.query(`ALTER TABLE "admissions" ADD "date_discharged" text`);
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "start_discharge_by"`);
        await queryRunner.query(`ALTER TABLE "admissions" ADD "start_discharge_by" text`);
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "start_discharge_date"`);
        await queryRunner.query(`ALTER TABLE "admissions" ADD "start_discharge_date" text`);
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "reason"`);
        await queryRunner.query(`ALTER TABLE "admissions" ADD "reason" character varying`);
    }

}
