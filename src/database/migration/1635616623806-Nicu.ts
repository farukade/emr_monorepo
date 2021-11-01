import {MigrationInterface, QueryRunner} from "typeorm";

export class Nicu1635616623806 implements MigrationInterface {
    name = 'Nicu1635616623806'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nicu-accommodations" ADD "quantity" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "nicu" ADD "accommodation_assigned_at" character varying`);
        await queryRunner.query(`ALTER TABLE "nicu" ADD "accommodation_assigned_by" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nicu" DROP COLUMN "accommodation_assigned_by"`);
        await queryRunner.query(`ALTER TABLE "nicu" DROP COLUMN "accommodation_assigned_at"`);
        await queryRunner.query(`ALTER TABLE "nicu-accommodations" DROP COLUMN "quantity"`);
    }

}
