import {MigrationInterface, QueryRunner} from "typeorm";

export class Cafeteria1655744822793 implements MigrationInterface {
    name = 'Cafeteria1655744822793'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "cafeteria_orders" ("id" SERIAL NOT NULL, "old_id" character varying, "createdBy" character varying(300) NOT NULL DEFAULT 'admin', "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "customer" character varying, "quantity" integer NOT NULL DEFAULT '0', "status" smallint NOT NULL DEFAULT '0', "amount" real NOT NULL DEFAULT '0', "ready_by" character varying, "ready_at" character varying, "cancelled_by" character varying, "cancelled_at" character varying, "patient_id" integer, "staff_id" integer, "food_item_id" integer, "transaction_id" integer, CONSTRAINT "PK_fd995c83ad5926ed79aaf1d8688" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "cafeteria_orders" ADD CONSTRAINT "FK_0af01377a59e36d2fcfb8d4477a" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cafeteria_orders" ADD CONSTRAINT "FK_620c6e8e9d5a8266d246873bd97" FOREIGN KEY ("staff_id") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cafeteria_orders" ADD CONSTRAINT "FK_5268b986f95c48cb53706b49709" FOREIGN KEY ("food_item_id") REFERENCES "cafeteria_food_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cafeteria_orders" ADD CONSTRAINT "FK_c9abc981304581441a2410ce78a" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cafeteria_orders" DROP CONSTRAINT "FK_c9abc981304581441a2410ce78a"`);
        await queryRunner.query(`ALTER TABLE "cafeteria_orders" DROP CONSTRAINT "FK_5268b986f95c48cb53706b49709"`);
        await queryRunner.query(`ALTER TABLE "cafeteria_orders" DROP CONSTRAINT "FK_620c6e8e9d5a8266d246873bd97"`);
        await queryRunner.query(`ALTER TABLE "cafeteria_orders" DROP CONSTRAINT "FK_0af01377a59e36d2fcfb8d4477a"`);
        await queryRunner.query(`DROP TABLE "cafeteria_orders"`);
    }

}
