import {MigrationInterface, QueryRunner} from "typeorm";

export class Admission1642598741301 implements MigrationInterface {
    name = 'Admission1642598741301'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "discharge_note"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admissions" ADD "discharge_note" text`);
    }

}
