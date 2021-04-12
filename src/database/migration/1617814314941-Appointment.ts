import {MigrationInterface, QueryRunner} from "typeorm";

export class Appointment1617814314941 implements MigrationInterface {
    name = 'Appointment1617814314941'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_diagnosis" DROP CONSTRAINT "FK_c51a8efad25e8399c018227925b"`);
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "appointmentType" SET DEFAULT 'patient'`);
        await queryRunner.query(`ALTER TABLE "patient_diagnosis" ADD CONSTRAINT "FK_2d6181c875a32b2ec25356689e5" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_diagnosis" DROP CONSTRAINT "FK_2d6181c875a32b2ec25356689e5"`);
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "appointmentType" SET DEFAULT 'in-patient'`);
        await queryRunner.query(`ALTER TABLE "patient_diagnosis" ADD CONSTRAINT "FK_c51a8efad25e8399c018227925b" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
