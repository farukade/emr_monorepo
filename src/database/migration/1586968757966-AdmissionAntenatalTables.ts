import {MigrationInterface, QueryRunner} from "typeorm";

export class AdmissionAntenatalTables1586968757966 implements MigrationInterface {
    name = 'AdmissionAntenatalTables1586968757966'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "admission_clinical_tasks" DROP COLUMN "startTime"`, undefined);
        await queryRunner.query(`ALTER TABLE "admission_clinical_tasks" ADD "startTime" character varying`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "admission_clinical_tasks" DROP COLUMN "startTime"`, undefined);
        await queryRunner.query(`ALTER TABLE "admission_clinical_tasks" ADD "startTime" TIMESTAMP`, undefined);
    }

}
