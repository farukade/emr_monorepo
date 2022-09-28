import {MigrationInterface, QueryRunner} from "typeorm";

export class DbMigration1662637743811 implements MigrationInterface {
    name = 'DbMigration1662637743811'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "transactions_food_items_cafeteria_food_items" ("transactionsId" integer NOT NULL, "cafeteriaFoodItemsId" integer NOT NULL, CONSTRAINT "PK_b7eb2d3bc3d505ec77faa51f6eb" PRIMARY KEY ("transactionsId", "cafeteriaFoodItemsId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_af39e4d2e57f1dc9091548d596" ON "transactions_food_items_cafeteria_food_items" ("transactionsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_8cb2903c76008fb0b2b9c4e95e" ON "transactions_food_items_cafeteria_food_items" ("cafeteriaFoodItemsId") `);
        await queryRunner.query(`ALTER TABLE "transactions_food_items_cafeteria_food_items" ADD CONSTRAINT "FK_af39e4d2e57f1dc9091548d596b" FOREIGN KEY ("transactionsId") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactions_food_items_cafeteria_food_items" ADD CONSTRAINT "FK_8cb2903c76008fb0b2b9c4e95e4" FOREIGN KEY ("cafeteriaFoodItemsId") REFERENCES "cafeteria_food_items"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions_food_items_cafeteria_food_items" DROP CONSTRAINT "FK_8cb2903c76008fb0b2b9c4e95e4"`);
        await queryRunner.query(`ALTER TABLE "transactions_food_items_cafeteria_food_items" DROP CONSTRAINT "FK_af39e4d2e57f1dc9091548d596b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8cb2903c76008fb0b2b9c4e95e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_af39e4d2e57f1dc9091548d596"`);
        await queryRunner.query(`DROP TABLE "transactions_food_items_cafeteria_food_items"`);
    }

}
