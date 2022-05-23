import {MigrationInterface, QueryRunner} from "typeorm";

export class Cafeteria1653169731922 implements MigrationInterface {
    name = 'Cafeteria1653169731922'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cafeteria_items" DROP COLUMN "discount_price"`);
        await queryRunner.query(`ALTER TABLE "cafeteria_items" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "cafeteria_food_items" ADD "price" real NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "cafeteria_food_items" ADD "discount_price" real NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "cafeteria_food_items" ADD "staff_price" real NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cafeteria_food_items" DROP COLUMN "staff_price"`);
        await queryRunner.query(`ALTER TABLE "cafeteria_food_items" DROP COLUMN "discount_price"`);
        await queryRunner.query(`ALTER TABLE "cafeteria_food_items" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "cafeteria_items" ADD "price" real`);
        await queryRunner.query(`ALTER TABLE "cafeteria_items" ADD "discount_price" real`);
    }

}
