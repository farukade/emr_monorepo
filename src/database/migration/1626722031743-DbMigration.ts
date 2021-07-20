import {MigrationInterface, QueryRunner} from "typeorm";

export class DbMigration1626722031743 implements MigrationInterface {
    name = 'DbMigration1626722031743'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patients" ADD "is_out_patient" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "is_out_patient"`);
    }

}
