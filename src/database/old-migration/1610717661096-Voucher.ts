import {MigrationInterface, QueryRunner} from "typeorm";

export class Voucher1610717661096 implements MigrationInterface {
    name = 'Voucher1610717661096'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vouchers" ADD "start_date" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vouchers" DROP COLUMN "start_date"`);
    }

}
