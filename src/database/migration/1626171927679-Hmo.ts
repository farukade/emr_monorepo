import {MigrationInterface, QueryRunner} from "typeorm";

export class Hmo1626171927679 implements MigrationInterface {
    name = 'Hmo1626171927679'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "hmos" ADD "coverage_type" character varying NOT NULL DEFAULT 'full'`);
        await queryRunner.query(`ALTER TABLE "hmos" ADD "coverage" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "hmos" DROP COLUMN "coverage"`);
        await queryRunner.query(`ALTER TABLE "hmos" DROP COLUMN "coverage_type"`);
    }

}
