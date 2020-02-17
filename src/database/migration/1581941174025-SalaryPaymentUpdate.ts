import {MigrationInterface, QueryRunner} from "typeorm";

export class SalaryPaymentUpdate1581941174025 implements MigrationInterface {
    name = 'SalaryPaymentUpdate1581941174025'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "salary_payments" DROP CONSTRAINT "FK_d6dd3b0f329e6a6f73eae8b59c4"`, undefined);
        await queryRunner.query(`ALTER TABLE "salary_payments" DROP COLUMN "staff_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "salary_payments" ADD "staff_id" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "salary_payments" ADD "emp_code" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "salary_payments" ADD "staff_name" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "salary_payments" ADD "department" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "salary_payments" ADD CONSTRAINT "FK_d6dd3b0f329e6a6f73eae8b59c4" FOREIGN KEY ("staff_id") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "salary_payments" DROP CONSTRAINT "FK_d6dd3b0f329e6a6f73eae8b59c4"`, undefined);
        await queryRunner.query(`ALTER TABLE "salary_payments" DROP COLUMN "department"`, undefined);
        await queryRunner.query(`ALTER TABLE "salary_payments" DROP COLUMN "staff_name"`, undefined);
        await queryRunner.query(`ALTER TABLE "salary_payments" DROP COLUMN "emp_code"`, undefined);
        await queryRunner.query(`ALTER TABLE "salary_payments" DROP COLUMN "staff_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "salary_payments" ADD "staff_id" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "salary_payments" ADD CONSTRAINT "FK_d6dd3b0f329e6a6f73eae8b59c4" FOREIGN KEY ("staff_id") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

}
