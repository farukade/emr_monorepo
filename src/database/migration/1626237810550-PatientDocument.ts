import {MigrationInterface, QueryRunner} from "typeorm";

export class PatientDocument1626237810550 implements MigrationInterface {
    name = 'PatientDocument1626237810550'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_documents" DROP CONSTRAINT "FK_a7424418f442e66865f2b8e35f6"`);
        await queryRunner.query(`ALTER TABLE "patient_documents" RENAME COLUMN "patientId" TO "patient_id"`);
        await queryRunner.query(`ALTER TABLE "patient_documents" ADD CONSTRAINT "FK_1a2f2efebe9442fc0c64c5d8db3" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_documents" DROP CONSTRAINT "FK_1a2f2efebe9442fc0c64c5d8db3"`);
        await queryRunner.query(`ALTER TABLE "patient_documents" RENAME COLUMN "patient_id" TO "patientId"`);
        await queryRunner.query(`ALTER TABLE "patient_documents" ADD CONSTRAINT "FK_a7424418f442e66865f2b8e35f6" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
