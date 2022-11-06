import {MigrationInterface, QueryRunner} from "typeorm";

export class InventoryActivity1644915055637 implements MigrationInterface {
    name = 'InventoryActivity1644915055637'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "inventory_activities" DROP COLUMN "unit_price"`);
        await queryRunner.query(`ALTER TABLE "inventory_activities" ADD "unit_price" real NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "inventory_activities" DROP COLUMN "unit_price"`);
        await queryRunner.query(`ALTER TABLE "inventory_activities" ADD "unit_price" integer NOT NULL DEFAULT '0'`);
    }

}
