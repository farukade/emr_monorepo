import {MigrationInterface, QueryRunner} from "typeorm";

export class StockTableUpdate1588105925773 implements MigrationInterface {
    name = 'StockTableUpdate1588105925773'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "stocks" ADD "generic_name" character varying(300)`, undefined);
        await queryRunner.query(`ALTER TABLE "stocks" ADD CONSTRAINT "UQ_be76e0167630fb8261f3bbf81f1" UNIQUE ("generic_name")`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "stocks" DROP CONSTRAINT "UQ_be76e0167630fb8261f3bbf81f1"`, undefined);
        await queryRunner.query(`ALTER TABLE "stocks" DROP COLUMN "generic_name"`, undefined);
    }

}
