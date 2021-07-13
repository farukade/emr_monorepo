import {MigrationInterface, QueryRunner} from "typeorm";

export class Transaction1626164898190 implements MigrationInterface {
    name = 'Transaction1626164898190'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" ADD "part_payment_expiry_date" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "part_payment_expiry_date"`);
    }

}
