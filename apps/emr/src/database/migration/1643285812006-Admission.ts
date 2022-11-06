import {MigrationInterface, QueryRunner} from "typeorm";

export class Admission1643285812006 implements MigrationInterface {
    name = 'Admission1643285812006'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "risk_to_fall"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admissions" ADD "risk_to_fall" boolean NOT NULL DEFAULT false`);
    }

}
