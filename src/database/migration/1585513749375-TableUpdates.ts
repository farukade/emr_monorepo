import {MigrationInterface, QueryRunner} from "typeorm";

export class TableUpdates1585513749375 implements MigrationInterface {
    name = 'TableUpdates1585513749375'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_086ea3f27fe3d9ae5198a4f254e"`, undefined);
        await queryRunner.query(`CREATE TABLE "cafeteria_inventory_categories" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "name" character varying NOT NULL, CONSTRAINT "UQ_854762618165587d8ef64fdc346" UNIQUE ("name"), CONSTRAINT "PK_2acf4890cae534ba1644ea95d81" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "cafeteria_inventories" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "name" character varying NOT NULL, "stock_code" character varying, "description" character varying, "cost_price" character varying, "quantity" character varying, "categoryId" uuid, CONSTRAINT "PK_f4dc057ccb5defa200880d18c9a" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "cafeteria_item_categories" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "name" character varying NOT NULL, CONSTRAINT "UQ_a3c54a81c3b3c5b5dc763fe916a" UNIQUE ("name"), CONSTRAINT "PK_119646eff5d9389a6cd300e4c9d" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "cafeteria_items" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "name" character varying NOT NULL, "item_code" character varying, "description" character varying, "price" real, "discount_price" character varying, "categoryId" uuid, CONSTRAINT "PK_ff26233a4792794c0f23a7cefa7" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "voucher_amount"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "amount_paid"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "balance"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "payment_type"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "voucher_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "vouchers" ADD "amount_used" real`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "voucher_amount" real`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "amount_paid" real`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "balance" real`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "payment_type" character varying`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "voucher_id" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_086ea3f27fe3d9ae5198a4f254e" FOREIGN KEY ("voucher_id") REFERENCES "vouchers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "cafeteria_inventories" ADD CONSTRAINT "FK_4160294afacf5c511b08ab968b6" FOREIGN KEY ("categoryId") REFERENCES "cafeteria_inventory_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "cafeteria_items" ADD CONSTRAINT "FK_7ea75a4e0d7b2af58167fd83d2b" FOREIGN KEY ("categoryId") REFERENCES "cafeteria_item_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "cafeteria_items" DROP CONSTRAINT "FK_7ea75a4e0d7b2af58167fd83d2b"`, undefined);
        await queryRunner.query(`ALTER TABLE "cafeteria_inventories" DROP CONSTRAINT "FK_4160294afacf5c511b08ab968b6"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_086ea3f27fe3d9ae5198a4f254e"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "voucher_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "payment_type"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "balance"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "amount_paid"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "voucher_amount"`, undefined);
        await queryRunner.query(`ALTER TABLE "vouchers" DROP COLUMN "amount_used"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "voucher_id" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "payment_type" character varying`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "balance" real`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "amount_paid" real`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "voucher_amount" real`, undefined);
        await queryRunner.query(`DROP TABLE "cafeteria_items"`, undefined);
        await queryRunner.query(`DROP TABLE "cafeteria_item_categories"`, undefined);
        await queryRunner.query(`DROP TABLE "cafeteria_inventories"`, undefined);
        await queryRunner.query(`DROP TABLE "cafeteria_inventory_categories"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_086ea3f27fe3d9ae5198a4f254e" FOREIGN KEY ("voucher_id") REFERENCES "vouchers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

}
