import {MigrationInterface, QueryRunner} from "typeorm";

export class Patient1626233374031 implements MigrationInterface {
    name = 'Patient1626233374031'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patients" ADD "credit_limit" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "patients" ADD "credit_limit_expiry_date" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "credit_limit_expiry_date"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "credit_limit"`);
    }

}
