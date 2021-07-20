import {MigrationInterface, QueryRunner} from "typeorm";

export class DbMigration1626757276859 implements MigrationInterface {
    name = 'DbMigration1626757276859'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" ADD "transaction_type" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "transaction_type"`);
    }

}
