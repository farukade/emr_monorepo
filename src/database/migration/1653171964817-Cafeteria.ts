import {MigrationInterface, QueryRunner} from "typeorm";

export class Cafeteria1653171964817 implements MigrationInterface {
    name = 'Cafeteria1653171964817'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cafeteria_food_items" ADD "unit" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cafeteria_food_items" DROP COLUMN "unit"`);
    }

}
