import {MigrationInterface, QueryRunner} from "typeorm";

export class InventoryUpdates1581932433824 implements MigrationInterface {
    name = 'InventoryUpdates1581932433824'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "salary_payment_deductions" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "label" character varying(50) NOT NULL, "value" character varying(20) NOT NULL, "salary_payment_id" uuid, CONSTRAINT "PK_84dbbb6a5ab13fed1e6c1782fd9" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "salary_payment_allowances" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "label" character varying(50) NOT NULL, "value" character varying(20) NOT NULL, "salary_payment_id" uuid, CONSTRAINT "PK_92cf5bdb9cd79fa76acae964895" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "salary_payment_deductions" ADD CONSTRAINT "FK_a7f74472af205feed4f6214d0a0" FOREIGN KEY ("salary_payment_id") REFERENCES "salary_payments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "salary_payment_allowances" ADD CONSTRAINT "FK_c678ec63f5e31bdb361a912298b" FOREIGN KEY ("salary_payment_id") REFERENCES "salary_payments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "salary_payment_allowances" DROP CONSTRAINT "FK_c678ec63f5e31bdb361a912298b"`, undefined);
        await queryRunner.query(`ALTER TABLE "salary_payment_deductions" DROP CONSTRAINT "FK_a7f74472af205feed4f6214d0a0"`, undefined);
        await queryRunner.query(`DROP TABLE "salary_payment_allowances"`, undefined);
        await queryRunner.query(`DROP TABLE "salary_payment_deductions"`, undefined);
    }

}
