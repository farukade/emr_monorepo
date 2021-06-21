import {MigrationInterface, QueryRunner} from "typeorm";

export class RequestItem1623910230497 implements MigrationInterface {
    name = 'RequestItem1623910230497'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_request_items" ADD "started_date" character varying`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" ADD "finished_date" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_request_items" DROP COLUMN "finished_date"`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" DROP COLUMN "started_date"`);
    }

}
