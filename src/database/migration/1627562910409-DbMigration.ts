import {MigrationInterface, QueryRunner} from "typeorm";

export class DbMigration1627562910409 implements MigrationInterface {
    name = 'DbMigration1627562910409'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "store_inventories" DROP COLUMN "cost_price"`);
        await queryRunner.query(`ALTER TABLE "store_inventories" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "store_inventories" ADD "unit_of_measure" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "store_inventories" DROP COLUMN "unit_of_measure"`);
        await queryRunner.query(`ALTER TABLE "store_inventories" ADD "description" character varying`);
        await queryRunner.query(`ALTER TABLE "store_inventories" ADD "cost_price" double precision NOT NULL DEFAULT '0'`);
    }

}
