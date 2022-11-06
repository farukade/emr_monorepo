import {MigrationInterface, QueryRunner} from "typeorm";

export class DBMigration1658408711733 implements MigrationInterface {
    name = 'DBMigration1658408711733'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "permissions" DROP CONSTRAINT "FK_e4bd61cc68f39f6d12f38fd9564"`);
        await queryRunner.query(`CREATE TABLE "permission_categories" ("id" SERIAL NOT NULL, "old_id" character varying, "createdBy" character varying(300) NOT NULL DEFAULT 'admin', "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying(300) NOT NULL, "slug" character varying, CONSTRAINT "PK_74d37787e3657c0a4f38501fd8c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cafeteria_orders" ("id" SERIAL NOT NULL, "old_id" character varying, "createdBy" character varying(300) NOT NULL DEFAULT 'admin', "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "customer" character varying, "name" character varying, "quantity" integer NOT NULL DEFAULT '0', "status" smallint NOT NULL DEFAULT '0', "amount" real NOT NULL DEFAULT '0', "ready_by" character varying, "ready_at" character varying, "cancelled_by" character varying, "cancelled_at" character varying, "patient_id" integer, "staff_id" integer, "food_item_id" integer, "transaction_id" integer, CONSTRAINT "PK_fd995c83ad5926ed79aaf1d8688" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "attendance-device" ("id" SERIAL NOT NULL, "old_id" character varying, "createdBy" character varying(300) NOT NULL DEFAULT 'admin', "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "ip" character varying NOT NULL, "name" character varying, CONSTRAINT "PK_ba19140f051c7074e5baf101416" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "attendance" ("id" SERIAL NOT NULL, "old_id" character varying, "createdBy" character varying(300) NOT NULL DEFAULT 'admin', "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "date" TIMESTAMP NOT NULL, "ip" character varying NOT NULL, "staff_id" integer, "device_id" integer, CONSTRAINT "PK_ee0ffe42c1f1a01e72b725c0cb2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "patients" ADD "mother_id" integer`);
        await queryRunner.query(`ALTER TABLE "staff_details" ADD "isOnDevice" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "cafeteria_food_items" ADD "category" character varying NOT NULL DEFAULT 'Show Case'`);
        await queryRunner.query(`ALTER TABLE "cafeteria_food_items" ADD "category_slug" character varying NOT NULL DEFAULT 'show-case'`);
        await queryRunner.query(`CREATE INDEX "IDX_cdd7d6051a46bbfb8a54544a5f" ON "patients" ("legacy_patient_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_a0c874cde9f34400a79c05dd90" ON "patients" ("surname") `);
        await queryRunner.query(`CREATE INDEX "IDX_dba14c30be7cdfb02a0953dea7" ON "patients" ("other_names") `);
        await queryRunner.query(`CREATE INDEX "IDX_9d1297a7e4cea1d695fc050eec" ON "patients" ("phone_number") `);
        await queryRunner.query(`ALTER TABLE "permissions" ADD CONSTRAINT "FK_e4bd61cc68f39f6d12f38fd9564" FOREIGN KEY ("category_id") REFERENCES "permission_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cafeteria_orders" ADD CONSTRAINT "FK_0af01377a59e36d2fcfb8d4477a" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cafeteria_orders" ADD CONSTRAINT "FK_620c6e8e9d5a8266d246873bd97" FOREIGN KEY ("staff_id") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cafeteria_orders" ADD CONSTRAINT "FK_5268b986f95c48cb53706b49709" FOREIGN KEY ("food_item_id") REFERENCES "cafeteria_food_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cafeteria_orders" ADD CONSTRAINT "FK_c9abc981304581441a2410ce78a" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendance" ADD CONSTRAINT "FK_99d7d43e6a69506c5f71095a108" FOREIGN KEY ("staff_id") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendance" ADD CONSTRAINT "FK_f0d27f126d15fb5d222aa986459" FOREIGN KEY ("device_id") REFERENCES "attendance-device"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attendance" DROP CONSTRAINT "FK_f0d27f126d15fb5d222aa986459"`);
        await queryRunner.query(`ALTER TABLE "attendance" DROP CONSTRAINT "FK_99d7d43e6a69506c5f71095a108"`);
        await queryRunner.query(`ALTER TABLE "cafeteria_orders" DROP CONSTRAINT "FK_c9abc981304581441a2410ce78a"`);
        await queryRunner.query(`ALTER TABLE "cafeteria_orders" DROP CONSTRAINT "FK_5268b986f95c48cb53706b49709"`);
        await queryRunner.query(`ALTER TABLE "cafeteria_orders" DROP CONSTRAINT "FK_620c6e8e9d5a8266d246873bd97"`);
        await queryRunner.query(`ALTER TABLE "cafeteria_orders" DROP CONSTRAINT "FK_0af01377a59e36d2fcfb8d4477a"`);
        await queryRunner.query(`ALTER TABLE "permissions" DROP CONSTRAINT "FK_e4bd61cc68f39f6d12f38fd9564"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9d1297a7e4cea1d695fc050eec"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dba14c30be7cdfb02a0953dea7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a0c874cde9f34400a79c05dd90"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cdd7d6051a46bbfb8a54544a5f"`);
        await queryRunner.query(`ALTER TABLE "cafeteria_food_items" DROP COLUMN "category_slug"`);
        await queryRunner.query(`ALTER TABLE "cafeteria_food_items" DROP COLUMN "category"`);
        await queryRunner.query(`ALTER TABLE "staff_details" DROP COLUMN "isOnDevice"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "mother_id"`);
        await queryRunner.query(`DROP TABLE "attendance"`);
        await queryRunner.query(`DROP TABLE "attendance-device"`);
        await queryRunner.query(`DROP TABLE "cafeteria_orders"`);
        await queryRunner.query(`DROP TABLE "permission_categories"`);
        await queryRunner.query(`ALTER TABLE "permissions" ADD CONSTRAINT "FK_e4bd61cc68f39f6d12f38fd9564" FOREIGN KEY ("category_id") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
