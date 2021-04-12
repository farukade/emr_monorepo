import {MigrationInterface, QueryRunner} from "typeorm";

export class RequestItem1617943416908 implements MigrationInterface {
    name = 'RequestItem1617943416908'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_request_items" ADD "dose_quantity" integer`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" ADD "refillable" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" ADD "refills" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" ADD "frequency" integer`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" ADD "frequencyType" character varying`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" ADD "duration" integer`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" ADD "external_prescription" character varying`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" ADD "vaccine_id" integer`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" ADD CONSTRAINT "FK_24adcac9a361af671e7bb2aefec" FOREIGN KEY ("vaccine_id") REFERENCES "immunizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_request_items" DROP CONSTRAINT "FK_24adcac9a361af671e7bb2aefec"`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" DROP COLUMN "vaccine_id"`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" DROP COLUMN "external_prescription"`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" DROP COLUMN "duration"`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" DROP COLUMN "frequencyType"`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" DROP COLUMN "frequency"`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" DROP COLUMN "refills"`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" DROP COLUMN "refillable"`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" DROP COLUMN "dose_quantity"`);
    }

}
