import {MigrationInterface, QueryRunner} from "typeorm";

export class Diagnosis1618894218214 implements MigrationInterface {
    name = 'Diagnosis1618894218214'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_diagnoses" ADD "type" character varying`);
        await queryRunner.query(`ALTER TABLE "patient_diagnoses" ADD "comment" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_diagnoses" DROP COLUMN "comment"`);
        await queryRunner.query(`ALTER TABLE "patient_diagnoses" DROP COLUMN "type"`);
    }

}
