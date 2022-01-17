import {MigrationInterface, QueryRunner} from "typeorm";

export class PatientNote1642424892671 implements MigrationInterface {
    name = 'PatientNote1642424892671'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_notes" ADD "labour_id" integer`);
        await queryRunner.query(`ALTER TABLE "patient_notes" ADD CONSTRAINT "FK_9912c9a499739fa4aba79275883" FOREIGN KEY ("labour_id") REFERENCES "labour_enrollments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_notes" DROP CONSTRAINT "FK_9912c9a499739fa4aba79275883"`);
        await queryRunner.query(`ALTER TABLE "patient_notes" DROP COLUMN "labour_id"`);
    }

}
