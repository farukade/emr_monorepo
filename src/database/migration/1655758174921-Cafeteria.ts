import {MigrationInterface, QueryRunner} from "typeorm";

export class Cafeteria1655758174921 implements MigrationInterface {
    name = 'Cafeteria1655758174921'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cafeteria_orders" ADD "name" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cafeteria_orders" DROP COLUMN "name"`);
    }

}
