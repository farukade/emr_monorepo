import {MigrationInterface, QueryRunner} from "typeorm";

export class immunizationTableUpdate1587819499319 implements MigrationInterface {
    name = 'immunizationTableUpdate1587819499319'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "prescription"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "prescription" jsonb`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "prescription"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "prescription" character varying NOT NULL`, undefined);
    }

}
