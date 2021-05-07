import {MigrationInterface, QueryRunner} from "typeorm";

export class Note1620397327437 implements MigrationInterface {
    name = 'Note1620397327437'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_notes" ADD "category" character varying`);
        await queryRunner.query(`ALTER TABLE "patient_notes" ADD "specialty" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_notes" DROP COLUMN "specialty"`);
        await queryRunner.query(`ALTER TABLE "patient_notes" DROP COLUMN "category"`);
    }

}
