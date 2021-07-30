import {MigrationInterface, QueryRunner} from "typeorm";

export class DbMigration1627563035340 implements MigrationInterface {
    name = 'DbMigration1627563035340'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "store_inventories" DROP COLUMN "slug"`);
        await queryRunner.query(`ALTER TABLE "cafeteria_inventories" DROP COLUMN "cost_price"`);
        await queryRunner.query(`ALTER TABLE "cafeteria_inventories" DROP COLUMN "slug"`);
        await queryRunner.query(`ALTER TABLE "cafeteria_inventories" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "cafeteria_inventories" ADD "code" character varying`);
        await queryRunner.query(`ALTER TABLE "cafeteria_inventories" ADD "unit_of_measure" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cafeteria_inventories" DROP COLUMN "unit_of_measure"`);
        await queryRunner.query(`ALTER TABLE "cafeteria_inventories" DROP COLUMN "code"`);
        await queryRunner.query(`ALTER TABLE "cafeteria_inventories" ADD "description" character varying`);
        await queryRunner.query(`ALTER TABLE "cafeteria_inventories" ADD "slug" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "cafeteria_inventories" ADD "cost_price" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "store_inventories" ADD "slug" character varying NOT NULL`);
    }

}
