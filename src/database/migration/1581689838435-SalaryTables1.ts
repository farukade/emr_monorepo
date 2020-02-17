import {MigrationInterface, QueryRunner} from "typeorm";

export class SalaryTables11581689838435 implements MigrationInterface {
    name = 'SalaryTables11581689838435'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "salary_allowances" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "label" character varying(50) NOT NULL, "value" character varying(20) NOT NULL, CONSTRAINT "PK_1aa72d37fdaaa545c767217b48a" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "salary_deductions" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "label" character varying(50) NOT NULL, "value" character varying(20) NOT NULL, CONSTRAINT "PK_9387f4c505caeb666373ebd0dcb" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "salary_payments" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "payment_month" character varying(20) NOT NULL, "total_allowance" integer, "total_deduction" integer, "amount_paid" integer, "comment" character varying, "status" smallint NOT NULL DEFAULT 0, "staff_id" uuid, CONSTRAINT "PK_dde0dd5e8632eef035da694183a" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "salary_payments" ADD CONSTRAINT "FK_d6dd3b0f329e6a6f73eae8b59c4" FOREIGN KEY ("staff_id") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "salary_payments" DROP CONSTRAINT "FK_d6dd3b0f329e6a6f73eae8b59c4"`, undefined);
        await queryRunner.query(`DROP TABLE "salary_payments"`, undefined);
        await queryRunner.query(`DROP TABLE "salary_deductions"`, undefined);
        await queryRunner.query(`DROP TABLE "salary_allowances"`, undefined);
    }

}
