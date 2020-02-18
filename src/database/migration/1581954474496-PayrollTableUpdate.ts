import {MigrationInterface, QueryRunner} from "typeorm";

export class PayrollTableUpdate1581954474496 implements MigrationInterface {
    name = 'PayrollTableUpdate1581954474496'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "salary_payments" ADD "department_id" character varying NOT NULL`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "salary_payments" DROP COLUMN "department_id"`, undefined);
    }

}
