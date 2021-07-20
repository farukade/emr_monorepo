import {MigrationInterface, QueryRunner} from "typeorm";

export class DbMigration1626760264235 implements MigrationInterface {
    name = 'DbMigration1626760264235'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "remaining"`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "change" real NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "balance" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "balance" SET DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "balance" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "balance" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "change"`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "remaining" real`);
    }

}
