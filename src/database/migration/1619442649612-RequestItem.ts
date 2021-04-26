import {MigrationInterface, QueryRunner} from "typeorm";

export class RequestItem1619442649612 implements MigrationInterface {
    name = 'RequestItem1619442649612'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_request_items" DROP COLUMN "dose_quantity"`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" ADD "dose_quantity" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_request_items" DROP COLUMN "dose_quantity"`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" ADD "dose_quantity" integer`);
    }

}
