import {MigrationInterface, QueryRunner} from "typeorm";

export class ClinicalTasks1608554259421 implements MigrationInterface {
    name = 'ClinicalTasks1608554259421'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "admission_clinical_tasks" ADD "title" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "admission_clinical_tasks" ADD "completed" boolean NOT NULL DEFAULT false`, undefined);
        await queryRunner.query(`ALTER TABLE "admission_clinical_tasks" ADD "drug" jsonb`, undefined);
        await queryRunner.query(`ALTER TABLE "admission_clinical_tasks" ADD "dose" integer NOT NULL DEFAULT 0`, undefined);
        await queryRunner.query(`ALTER TABLE "admission_clinical_tasks" ADD "frequency" character varying`, undefined);
        await queryRunner.query(`ALTER TABLE "admission_clinical_tasks" ADD "request_id" integer`, undefined);
        await queryRunner.query(`ALTER TABLE "admission_clinical_tasks" ADD CONSTRAINT "FK_c55caffa3eea9fee0564b7ef8f4" FOREIGN KEY ("request_id") REFERENCES "patient_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "admission_clinical_tasks" ADD "taskType" character varying NOT NULL DEFAULT 'vitals'`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "admission_clinical_tasks" DROP COLUMN "taskType"`, undefined);
        await queryRunner.query(`ALTER TABLE "admission_clinical_tasks" DROP CONSTRAINT "FK_c55caffa3eea9fee0564b7ef8f4"`, undefined);
        await queryRunner.query(`ALTER TABLE "admission_clinical_tasks" DROP COLUMN "request_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "admission_clinical_tasks" DROP COLUMN "frequency"`, undefined);
        await queryRunner.query(`ALTER TABLE "admission_clinical_tasks" DROP COLUMN "dose"`, undefined);
        await queryRunner.query(`ALTER TABLE "admission_clinical_tasks" DROP COLUMN "drug"`, undefined);
        await queryRunner.query(`ALTER TABLE "admission_clinical_tasks" DROP COLUMN "completed"`, undefined);
        await queryRunner.query(`ALTER TABLE "admission_clinical_tasks" DROP COLUMN "title"`, undefined);
    }

}
