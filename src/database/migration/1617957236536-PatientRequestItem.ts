import {MigrationInterface, QueryRunner} from "typeorm";

export class PatientRequestItem1617957236536 implements MigrationInterface {
    name = 'PatientRequestItem1617957236536'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_request_items" ADD "fill_quantity" smallint NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_request_items" DROP COLUMN "fill_quantity"`);
    }

}
