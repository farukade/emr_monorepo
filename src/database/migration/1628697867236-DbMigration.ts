import {MigrationInterface, QueryRunner} from "typeorm";

export class DbMigration1628697867236 implements MigrationInterface {
    name = 'DbMigration1628697867236'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "number_of_visits"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patients" ADD "number_of_visits" integer DEFAULT '0'`);
    }

}
