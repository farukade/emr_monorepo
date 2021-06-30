import {MigrationInterface, QueryRunner} from "typeorm";

export class Nicu1625040435286 implements MigrationInterface {
    name = 'Nicu1625040435286'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nicu" DROP COLUMN "temperature"`);
        await queryRunner.query(`ALTER TABLE "nicu" DROP COLUMN "pulse"`);
        await queryRunner.query(`ALTER TABLE "nicu" DROP COLUMN "resp"`);
        await queryRunner.query(`ALTER TABLE "nicu" DROP COLUMN "sp02"`);
        await queryRunner.query(`ALTER TABLE "nicu" DROP COLUMN "oxygen"`);
        await queryRunner.query(`ALTER TABLE "nicu" DROP COLUMN "cypap"`);
        await queryRunner.query(`ALTER TABLE "nicu" DROP COLUMN "offoxygen"`);
        await queryRunner.query(`ALTER TABLE "nicu" DROP COLUMN "remark"`);
        await queryRunner.query(`ALTER TABLE "nicu" ADD "room" character varying`);
        await queryRunner.query(`ALTER TABLE "nicu" ADD "status" smallint NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nicu" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "nicu" DROP COLUMN "room"`);
        await queryRunner.query(`ALTER TABLE "nicu" ADD "remark" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "nicu" ADD "offoxygen" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "nicu" ADD "cypap" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "nicu" ADD "oxygen" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "nicu" ADD "sp02" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "nicu" ADD "resp" double precision NOT NULL`);
        await queryRunner.query(`ALTER TABLE "nicu" ADD "pulse" double precision NOT NULL`);
        await queryRunner.query(`ALTER TABLE "nicu" ADD "temperature" double precision NOT NULL`);
    }

}
