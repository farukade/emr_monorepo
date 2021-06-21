import {MigrationInterface, QueryRunner} from "typeorm";

export class Cafeteria1622229158188 implements MigrationInterface {
    name = 'Cafeteria1622229158188'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cafeteria_items" ADD "discount_price" real`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cafeteria_items" DROP COLUMN "discount_price"`);
    }

}
