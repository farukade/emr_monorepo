import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdatedCountryTable1582191447791 implements MigrationInterface {
    name = 'UpdatedCountryTable1582191447791'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "countries" DROP COLUMN "country_code"`, undefined);
        await queryRunner.query(`ALTER TABLE "countries" DROP COLUMN "country_code_long"`, undefined);
        await queryRunner.query(`ALTER TABLE "countries" DROP COLUMN "dial_code"`, undefined);
        await queryRunner.query(`ALTER TABLE "countries" DROP COLUMN "currency_name"`, undefined);
        await queryRunner.query(`ALTER TABLE "countries" DROP COLUMN "currency_symbol"`, undefined);
        await queryRunner.query(`ALTER TABLE "countries" DROP COLUMN "currency_code"`, undefined);
        await queryRunner.query(`ALTER TABLE "countries" DROP COLUMN "countr_flag"`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "countries" ADD "countr_flag" character varying(50)`, undefined);
        await queryRunner.query(`ALTER TABLE "countries" ADD "currency_code" character varying(50)`, undefined);
        await queryRunner.query(`ALTER TABLE "countries" ADD "currency_symbol" character varying(50)`, undefined);
        await queryRunner.query(`ALTER TABLE "countries" ADD "currency_name" character varying(50)`, undefined);
        await queryRunner.query(`ALTER TABLE "countries" ADD "dial_code" character varying(20)`, undefined);
        await queryRunner.query(`ALTER TABLE "countries" ADD "country_code_long" character varying(50) NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "countries" ADD "country_code" character varying(20) NOT NULL`, undefined);
    }

}
