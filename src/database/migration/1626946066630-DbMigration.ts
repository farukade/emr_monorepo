import {MigrationInterface, QueryRunner} from "typeorm";

export class DbMigration1626946066630 implements MigrationInterface {
    name = 'DbMigration1626946066630'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "drugs" DROP COLUMN "base_price"`);
        await queryRunner.query(`ALTER TABLE "drugs" DROP COLUMN "unit_cost"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "drugs" ADD "unit_cost" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "drugs" ADD "base_price" double precision NOT NULL DEFAULT '0'`);
    }

}
