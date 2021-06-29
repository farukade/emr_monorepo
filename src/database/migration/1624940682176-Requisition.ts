import {MigrationInterface, QueryRunner} from "typeorm";

export class Requisition1624940682176 implements MigrationInterface {
    name = 'Requisition1624940682176'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "requisitions" ("id" SERIAL NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdBy" character varying(300), "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "staff_id" integer, "stock_id" integer, "cafeteria_id" integer, CONSTRAINT "PK_be24649237292ddbd473f3ded92" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "service_logs" ("id" SERIAL NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdBy" character varying(300), "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "phone" character varying, "email" character varying, "type" character varying, "message" character varying, "status" character varying, "errorMessage" character varying, "category" character varying, "data" jsonb, CONSTRAINT "PK_bca63249c66fd0803d17ca79e6e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "requisitions" ADD CONSTRAINT "FK_7829bc3ef8ed7c4cdec8c611284" FOREIGN KEY ("staff_id") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requisitions" ADD CONSTRAINT "FK_4a7891ee23645ca308d4c53dd68" FOREIGN KEY ("stock_id") REFERENCES "stocks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requisitions" ADD CONSTRAINT "FK_7dfcd1404988d3a04d779a8db29" FOREIGN KEY ("cafeteria_id") REFERENCES "cafeteria_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "requisitions" DROP CONSTRAINT "FK_7dfcd1404988d3a04d779a8db29"`);
        await queryRunner.query(`ALTER TABLE "requisitions" DROP CONSTRAINT "FK_4a7891ee23645ca308d4c53dd68"`);
        await queryRunner.query(`ALTER TABLE "requisitions" DROP CONSTRAINT "FK_7829bc3ef8ed7c4cdec8c611284"`);
        await queryRunner.query(`DROP TABLE "service_logs"`);
        await queryRunner.query(`DROP TABLE "requisitions"`);
    }

}
