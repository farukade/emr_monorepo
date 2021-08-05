import {MigrationInterface, QueryRunner} from "typeorm";

export class DbMigration1628164947508 implements MigrationInterface {
    name = 'DbMigration1628164947508'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_notes" ADD "history" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_notes" DROP COLUMN "history"`);
    }

}
