import {MigrationInterface, QueryRunner} from "typeorm";

export class Payroll1624967390343 implements MigrationInterface {
    name = 'Payroll1624967390343'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "salary_payments" DROP COLUMN "department"`);
        await queryRunner.query(`ALTER TABLE "salary_payments" DROP COLUMN "total_allowance"`);
        await queryRunner.query(`ALTER TABLE "salary_payments" ADD "total_allowance" real`);
        await queryRunner.query(`ALTER TABLE "salary_payments" DROP COLUMN "total_deduction"`);
        await queryRunner.query(`ALTER TABLE "salary_payments" ADD "total_deduction" real`);
        await queryRunner.query(`ALTER TABLE "salary_payments" DROP COLUMN "amount_paid"`);
        await queryRunner.query(`ALTER TABLE "salary_payments" ADD "amount_paid" real`);
        await queryRunner.query(`ALTER TABLE "salary_payments" DROP COLUMN "department_id"`);
        await queryRunner.query(`ALTER TABLE "salary_payments" ADD "department_id" integer`);
        await queryRunner.query(`ALTER TABLE "salary_payments" ADD CONSTRAINT "FK_a1a101d190471ed22ace39549d5" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "salary_payments" DROP CONSTRAINT "FK_a1a101d190471ed22ace39549d5"`);
        await queryRunner.query(`ALTER TABLE "salary_payments" DROP COLUMN "department_id"`);
        await queryRunner.query(`ALTER TABLE "salary_payments" ADD "department_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "salary_payments" DROP COLUMN "amount_paid"`);
        await queryRunner.query(`ALTER TABLE "salary_payments" ADD "amount_paid" integer`);
        await queryRunner.query(`ALTER TABLE "salary_payments" DROP COLUMN "total_deduction"`);
        await queryRunner.query(`ALTER TABLE "salary_payments" ADD "total_deduction" integer`);
        await queryRunner.query(`ALTER TABLE "salary_payments" DROP COLUMN "total_allowance"`);
        await queryRunner.query(`ALTER TABLE "salary_payments" ADD "total_allowance" integer`);
        await queryRunner.query(`ALTER TABLE "salary_payments" ADD "department" character varying`);
    }

}
