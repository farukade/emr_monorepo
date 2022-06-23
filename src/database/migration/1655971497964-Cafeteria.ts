import {MigrationInterface, QueryRunner} from "typeorm";

export class Cafeteria1655971497964 implements MigrationInterface {
    name = 'Cafeteria1655971497964'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cafeteria_food_items" ADD "category" character varying NOT NULL DEFAULT 'Show Case'`);
        await queryRunner.query(`ALTER TABLE "cafeteria_food_items" ADD "category_slug" character varying NOT NULL DEFAULT 'show-case'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cafeteria_food_items" DROP COLUMN "category_slug"`);
        await queryRunner.query(`ALTER TABLE "cafeteria_food_items" DROP COLUMN "category"`);
    }

}
