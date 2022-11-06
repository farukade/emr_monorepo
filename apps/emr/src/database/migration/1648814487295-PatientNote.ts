import {MigrationInterface, QueryRunner} from "typeorm";

export class PatientNote1648814487295 implements MigrationInterface {
    name = 'PatientNote1648814487295'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_notes" ADD "resolved_by" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "patient_notes" ADD "resolved_at" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_notes" DROP COLUMN "resolved_at"`);
        await queryRunner.query(`ALTER TABLE "patient_notes" DROP COLUMN "resolved_by"`);
    }

}
