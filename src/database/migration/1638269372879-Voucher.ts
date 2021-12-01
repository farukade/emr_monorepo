import {MigrationInterface, QueryRunner} from "typeorm";

export class Voucher1638269372879 implements MigrationInterface {
    name = 'Voucher1638269372879'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vouchers" DROP COLUMN "start_date"`);
        await queryRunner.query(`ALTER TABLE "vouchers" ADD "expiration_date" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "vouchers" ALTER COLUMN "amount_used" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "vouchers" ALTER COLUMN "amount_used" SET DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vouchers" ALTER COLUMN "amount_used" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "vouchers" ALTER COLUMN "amount_used" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "vouchers" DROP COLUMN "expiration_date"`);
        await queryRunner.query(`ALTER TABLE "vouchers" ADD "start_date" character varying NOT NULL`);
    }

}
