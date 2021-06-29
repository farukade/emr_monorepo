import {MigrationInterface, QueryRunner} from "typeorm";

export class Payroll1624964644910 implements MigrationInterface {
    name = 'Payroll1624964644910'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "salary_payments" ADD "staff_id" integer`);
        await queryRunner.query(`ALTER TABLE "salary_payments" ADD CONSTRAINT "FK_d6dd3b0f329e6a6f73eae8b59c4" FOREIGN KEY ("staff_id") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "salary_payments" DROP CONSTRAINT "FK_d6dd3b0f329e6a6f73eae8b59c4"`);
        await queryRunner.query(`ALTER TABLE "salary_payments" DROP COLUMN "staff_id"`);
    }

}
