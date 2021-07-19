import {MigrationInterface, QueryRunner} from "typeorm";

export class DbMigration1626697917706 implements MigrationInterface {
    name = 'DbMigration1626697917706'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "drugs" ADD "code" character varying(300) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "drugs" DROP COLUMN "code"`);
    }

}
