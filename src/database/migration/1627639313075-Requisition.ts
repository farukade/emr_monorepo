import {MigrationInterface, QueryRunner} from "typeorm";

export class Requisition1627639313075 implements MigrationInterface {
    name = 'Requisition1627639313075'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "requisitions" ADD "category" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "requisitions" ADD "declined" smallint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "requisitions" ADD "declined_by" character varying`);
        await queryRunner.query(`ALTER TABLE "requisitions" ADD "declined_at" character varying`);
        await queryRunner.query(`ALTER TABLE "requisitions" ADD "decline_reason" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "requisitions" DROP COLUMN "decline_reason"`);
        await queryRunner.query(`ALTER TABLE "requisitions" DROP COLUMN "declined_at"`);
        await queryRunner.query(`ALTER TABLE "requisitions" DROP COLUMN "declined_by"`);
        await queryRunner.query(`ALTER TABLE "requisitions" DROP COLUMN "declined"`);
        await queryRunner.query(`ALTER TABLE "requisitions" DROP COLUMN "category"`);
    }

}
