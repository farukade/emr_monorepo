import {MigrationInterface, QueryRunner} from "typeorm";

export class DbMigration1626949528606 implements MigrationInterface {
    name = 'DbMigration1626949528606'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" ADD "payment_method" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "payment_method"`);
    }

}
