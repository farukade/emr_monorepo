import {MigrationInterface, QueryRunner} from "typeorm";

export class Vitals1642580961702 implements MigrationInterface {
    name = 'Vitals1642580961702'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_vitals" ADD "admission_id" integer`);
        await queryRunner.query(`ALTER TABLE "patient_vitals" ADD "nicu_id" integer`);
        await queryRunner.query(`ALTER TABLE "patient_vitals" ADD "labour_id" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_vitals" DROP COLUMN "labour_id"`);
        await queryRunner.query(`ALTER TABLE "patient_vitals" DROP COLUMN "nicu_id"`);
        await queryRunner.query(`ALTER TABLE "patient_vitals" DROP COLUMN "admission_id"`);
    }

}
