import {MigrationInterface, QueryRunner} from "typeorm";

export class DbMigration1628097943205 implements MigrationInterface {
    name = 'DbMigration1628097943205'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_notes" ADD "visit" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_notes" DROP COLUMN "visit"`);
    }

}
