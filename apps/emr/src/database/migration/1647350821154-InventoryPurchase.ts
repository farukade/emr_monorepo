import {MigrationInterface, QueryRunner} from "typeorm";

export class InventoryPurchase1647350821154 implements MigrationInterface {
    name = 'InventoryPurchase1647350821154'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "inventory_purchases" ("id" SERIAL NOT NULL, "old_id" character varying, "createdBy" character varying(300) NOT NULL DEFAULT 'it-admin', "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "quantity" integer NOT NULL DEFAULT '0', "purchase_price" real NOT NULL DEFAULT '0', "item_id" integer, "item_category" character varying, "vendor_id" integer, CONSTRAINT "PK_e2164ffa30a08c2c4c6e52bcdb8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "inventory_purchases" ADD CONSTRAINT "FK_172c82b1721d61d5ec336bd9d2d" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "inventory_purchases" DROP CONSTRAINT "FK_172c82b1721d61d5ec336bd9d2d"`);
        await queryRunner.query(`DROP TABLE "inventory_purchases"`);
    }

}
