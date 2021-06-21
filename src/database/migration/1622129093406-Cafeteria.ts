import {MigrationInterface, QueryRunner} from "typeorm";

export class Cafeteria1622129093406 implements MigrationInterface {
    name = 'Cafeteria1622129093406'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cafeteria_items" DROP CONSTRAINT "FK_7ea75a4e0d7b2af58167fd83d2b"`);
        await queryRunner.query(`ALTER TABLE "cafeteria_items" DROP COLUMN "categoryId"`);
        await queryRunner.query(`ALTER TABLE "cafeteria_items" DROP COLUMN "item_code"`);
        await queryRunner.query(`ALTER TABLE "cafeteria_items" DROP COLUMN "discount_price"`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "sub_total" real`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "vat" real`);
        await queryRunner.query(`ALTER TABLE "performance_indicators" ADD "isSettingsObject" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "performance_indicators" ADD "department_id" integer`);
        await queryRunner.query(`ALTER TABLE "cafeteria_items" ADD "quantity" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "performance_indicators" ADD CONSTRAINT "FK_931cdeab6d7129a1be6be89146d" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "performance_indicators" DROP CONSTRAINT "FK_931cdeab6d7129a1be6be89146d"`);
        await queryRunner.query(`ALTER TABLE "cafeteria_items" DROP COLUMN "quantity"`);
        await queryRunner.query(`ALTER TABLE "performance_indicators" DROP COLUMN "department_id"`);
        await queryRunner.query(`ALTER TABLE "performance_indicators" DROP COLUMN "isSettingsObject"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "vat"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "sub_total"`);
        await queryRunner.query(`ALTER TABLE "cafeteria_items" ADD "discount_price" character varying`);
        await queryRunner.query(`ALTER TABLE "cafeteria_items" ADD "item_code" character varying`);
        await queryRunner.query(`ALTER TABLE "cafeteria_items" ADD "categoryId" integer`);
        await queryRunner.query(`ALTER TABLE "cafeteria_items" ADD CONSTRAINT "FK_7ea75a4e0d7b2af58167fd83d2b" FOREIGN KEY ("categoryId") REFERENCES "cafeteria_item_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
