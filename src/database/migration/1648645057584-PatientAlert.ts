import {MigrationInterface, QueryRunner} from "typeorm";

export class PatientAlert1648645057584 implements MigrationInterface {
    name = 'PatientAlert1648645057584'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_alerts" DROP COLUMN "read"`);
        await queryRunner.query(`ALTER TABLE "patient_alerts" DROP COLUMN "read_by"`);
        await queryRunner.query(`ALTER TABLE "patient_alerts" ADD "category" character varying NOT NULL DEFAULT 'normal'`);
        await queryRunner.query(`ALTER TABLE "patient_alerts" ADD "source" character varying`);
        await queryRunner.query(`ALTER TABLE "patient_alerts" ADD "item_id" integer`);
        await queryRunner.query(`ALTER TABLE "patient_alerts" ADD "closed" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "patient_alerts" ADD "closed_by" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "patient_alerts" ADD "closed_at" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_alerts" DROP COLUMN "closed_at"`);
        await queryRunner.query(`ALTER TABLE "patient_alerts" DROP COLUMN "closed_by"`);
        await queryRunner.query(`ALTER TABLE "patient_alerts" DROP COLUMN "closed"`);
        await queryRunner.query(`ALTER TABLE "patient_alerts" DROP COLUMN "item_id"`);
        await queryRunner.query(`ALTER TABLE "patient_alerts" DROP COLUMN "source"`);
        await queryRunner.query(`ALTER TABLE "patient_alerts" DROP COLUMN "category"`);
        await queryRunner.query(`ALTER TABLE "patient_alerts" ADD "read_by" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "patient_alerts" ADD "read" boolean NOT NULL DEFAULT false`);
    }

}
