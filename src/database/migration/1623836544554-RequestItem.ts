import {MigrationInterface, QueryRunner} from "typeorm";

export class RequestItem1623836544554 implements MigrationInterface {
    name = 'RequestItem1623836544554'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_request_items" ADD "scheduled_date" character varying`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" ADD "resources" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_request_items" DROP COLUMN "resources"`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" DROP COLUMN "scheduled_date"`);
    }

}
