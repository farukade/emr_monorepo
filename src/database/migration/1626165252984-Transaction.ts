import {MigrationInterface, QueryRunner} from "typeorm";

export class Transaction1626165252984 implements MigrationInterface {
    name = 'Transaction1626165252984'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" ADD "remaining" real`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "remaining"`);
    }

}
