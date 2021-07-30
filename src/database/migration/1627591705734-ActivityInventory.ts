import {MigrationInterface, QueryRunner} from "typeorm";

export class ActivityInventory1627591705734 implements MigrationInterface {
    name = 'ActivityInventory1627591705734'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "inventory_activities" ("id" SERIAL NOT NULL, "createdBy" character varying(300) NOT NULL DEFAULT 'it-admin', "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "quantity" integer NOT NULL DEFAULT '0', "unit_price" integer NOT NULL DEFAULT '0', "drug_batch_id" integer, "store_inventory_id" integer, "cafeteria_inventory_id" integer, CONSTRAINT "PK_3cf728b81db8ae7784fc940698b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "inventory_activities" ADD CONSTRAINT "FK_ef5108de2a166b61c2870178a08" FOREIGN KEY ("drug_batch_id") REFERENCES "drug_batches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inventory_activities" ADD CONSTRAINT "FK_9c2c035d28180ae194c1f25b41d" FOREIGN KEY ("store_inventory_id") REFERENCES "store_inventories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inventory_activities" ADD CONSTRAINT "FK_a770211f17587e737a1e765ea32" FOREIGN KEY ("cafeteria_inventory_id") REFERENCES "cafeteria_inventories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "inventory_activities" DROP CONSTRAINT "FK_a770211f17587e737a1e765ea32"`);
        await queryRunner.query(`ALTER TABLE "inventory_activities" DROP CONSTRAINT "FK_9c2c035d28180ae194c1f25b41d"`);
        await queryRunner.query(`ALTER TABLE "inventory_activities" DROP CONSTRAINT "FK_ef5108de2a166b61c2870178a08"`);
        await queryRunner.query(`DROP TABLE "inventory_activities"`);
    }

}
