import {MigrationInterface, QueryRunner} from "typeorm";

export class ClinicalTask1638450092222 implements MigrationInterface {
    name = 'ClinicalTask1638450092222'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admission_clinical_tasks" DROP COLUMN "dose"`);
        await queryRunner.query(`ALTER TABLE "admission_clinical_tasks" ADD "dose" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admission_clinical_tasks" DROP COLUMN "dose"`);
        await queryRunner.query(`ALTER TABLE "admission_clinical_tasks" ADD "dose" integer NOT NULL DEFAULT '0'`);
    }

}
