import {MigrationInterface, QueryRunner} from "typeorm";

export class Cafeteria1638344722159 implements MigrationInterface {
    name = 'Cafeteria1638344722159'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "cafeteria_food_items" ("id" SERIAL NOT NULL, "old_id" character varying, "createdBy" character varying(300) NOT NULL DEFAULT 'it-admin', "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "description" character varying, CONSTRAINT "PK_bf3f36dba9be8e380ca846b6ec6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "cafeteria_items" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "cafeteria_items" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "cafeteria_items" ADD "food_item_id" integer`);
        await queryRunner.query(`ALTER TABLE "cafeteria_items" ADD CONSTRAINT "FK_d28c8ce56a8d63e7f36d1dcf28f" FOREIGN KEY ("food_item_id") REFERENCES "cafeteria_food_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cafeteria_items" DROP CONSTRAINT "FK_d28c8ce56a8d63e7f36d1dcf28f"`);
        await queryRunner.query(`ALTER TABLE "cafeteria_items" DROP COLUMN "food_item_id"`);
        await queryRunner.query(`ALTER TABLE "cafeteria_items" ADD "description" character varying`);
        await queryRunner.query(`ALTER TABLE "cafeteria_items" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`DROP TABLE "cafeteria_food_items"`);
    }

}
