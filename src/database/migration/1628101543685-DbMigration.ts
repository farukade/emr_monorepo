import {MigrationInterface, QueryRunner} from "typeorm";

export class DbMigration1628101543685 implements MigrationInterface {
    name = 'DbMigration1628101543685'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_notes" ADD "note_type" character varying`);
        await queryRunner.query(`ALTER TABLE "patient_notes" ADD "ivf_id" integer`);
        await queryRunner.query(`ALTER TABLE "patient_notes" ADD "antenatal_id" integer`);
        await queryRunner.query(`ALTER TABLE "patient_notes" ADD CONSTRAINT "FK_ceb0ececb843de58c1d47d007b0" FOREIGN KEY ("ivf_id") REFERENCES "ivf_enrollments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_notes" ADD CONSTRAINT "FK_595bd5ccacc36913dd585190b82" FOREIGN KEY ("antenatal_id") REFERENCES "antenatal_enrollments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_notes" DROP CONSTRAINT "FK_595bd5ccacc36913dd585190b82"`);
        await queryRunner.query(`ALTER TABLE "patient_notes" DROP CONSTRAINT "FK_ceb0ececb843de58c1d47d007b0"`);
        await queryRunner.query(`ALTER TABLE "patient_notes" DROP COLUMN "antenatal_id"`);
        await queryRunner.query(`ALTER TABLE "patient_notes" DROP COLUMN "ivf_id"`);
        await queryRunner.query(`ALTER TABLE "patient_notes" DROP COLUMN "note_type"`);
    }

}
