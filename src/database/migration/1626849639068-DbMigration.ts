import {MigrationInterface, QueryRunner} from "typeorm";

export class DbMigration1626849639068 implements MigrationInterface {
    name = 'DbMigration1626849639068'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "amountToPay"`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "amountToPay" double precision NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "amountToPay"`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "amountToPay" real NOT NULL DEFAULT '0'`);
    }

}
