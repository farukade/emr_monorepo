import {MigrationInterface, QueryRunner} from "typeorm";

export class NicuAdmission1642527932496 implements MigrationInterface {
    name = 'NicuAdmission1642527932496'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admissions" DROP CONSTRAINT "FK_ead945020abc516c15034100035"`);
        await queryRunner.query(`ALTER TABLE "nicu" DROP CONSTRAINT "FK_04d64f533435cc27fc6502916da"`);
        await queryRunner.query(`ALTER TABLE "admissions" DROP CONSTRAINT "REL_ead945020abc516c1503410003"`);
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "nicu_id"`);
        await queryRunner.query(`ALTER TABLE "nicu" DROP CONSTRAINT "REL_04d64f533435cc27fc6502916d"`);
        await queryRunner.query(`ALTER TABLE "nicu" DROP COLUMN "admission_id"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "is_admitted"`);
        await queryRunner.query(`ALTER TABLE "nicu" ADD "health_state" character varying`);
        await queryRunner.query(`ALTER TABLE "nicu" ADD "reason" text`);
        await queryRunner.query(`ALTER TABLE "nicu" ADD "start_discharge" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "nicu" ADD "start_discharge_date" character varying`);
        await queryRunner.query(`ALTER TABLE "nicu" ADD "start_discharge_by" character varying`);
        await queryRunner.query(`ALTER TABLE "nicu" ADD "date_discharged" character varying`);
        await queryRunner.query(`ALTER TABLE "nicu" ADD "discharged_by" integer`);
        await queryRunner.query(`ALTER TABLE "admission_clinical_tasks" ADD "nicu_id" integer`);
        await queryRunner.query(`ALTER TABLE "admission_clinical_tasks" ADD "labour_id" integer`);
        await queryRunner.query(`ALTER TABLE "patient_notes" ADD "nicu_id" integer`);
        await queryRunner.query(`ALTER TABLE "patient_requests" ADD "nicu_id" integer`);
        await queryRunner.query(`ALTER TABLE "patients" ADD "admission_id" integer`);
        await queryRunner.query(`ALTER TABLE "patients" ADD "nicu_id" integer`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "nicu_id" integer`);
        await queryRunner.query(`ALTER TABLE "nicu" ADD CONSTRAINT "FK_e5ba1580ef3666c103e276c759d" FOREIGN KEY ("discharged_by") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admission_clinical_tasks" ADD CONSTRAINT "FK_24d3ce99e8d2951b3c946232c64" FOREIGN KEY ("nicu_id") REFERENCES "nicu"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admission_clinical_tasks" ADD CONSTRAINT "FK_137657b13974bea69eb2393c62d" FOREIGN KEY ("labour_id") REFERENCES "labour_enrollments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_notes" ADD CONSTRAINT "FK_ccdb15ded3338698a173cf5e491" FOREIGN KEY ("nicu_id") REFERENCES "nicu"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_requests" ADD CONSTRAINT "FK_06eb255427891814bcdc2a3d671" FOREIGN KEY ("nicu_id") REFERENCES "nicu"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_419eb4fc256252f48cee1ee9833" FOREIGN KEY ("nicu_id") REFERENCES "nicu"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_419eb4fc256252f48cee1ee9833"`);
        await queryRunner.query(`ALTER TABLE "patient_requests" DROP CONSTRAINT "FK_06eb255427891814bcdc2a3d671"`);
        await queryRunner.query(`ALTER TABLE "patient_notes" DROP CONSTRAINT "FK_ccdb15ded3338698a173cf5e491"`);
        await queryRunner.query(`ALTER TABLE "admission_clinical_tasks" DROP CONSTRAINT "FK_137657b13974bea69eb2393c62d"`);
        await queryRunner.query(`ALTER TABLE "admission_clinical_tasks" DROP CONSTRAINT "FK_24d3ce99e8d2951b3c946232c64"`);
        await queryRunner.query(`ALTER TABLE "nicu" DROP CONSTRAINT "FK_e5ba1580ef3666c103e276c759d"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "nicu_id"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "nicu_id"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "admission_id"`);
        await queryRunner.query(`ALTER TABLE "patient_requests" DROP COLUMN "nicu_id"`);
        await queryRunner.query(`ALTER TABLE "patient_notes" DROP COLUMN "nicu_id"`);
        await queryRunner.query(`ALTER TABLE "admission_clinical_tasks" DROP COLUMN "labour_id"`);
        await queryRunner.query(`ALTER TABLE "admission_clinical_tasks" DROP COLUMN "nicu_id"`);
        await queryRunner.query(`ALTER TABLE "nicu" DROP COLUMN "discharged_by"`);
        await queryRunner.query(`ALTER TABLE "nicu" DROP COLUMN "date_discharged"`);
        await queryRunner.query(`ALTER TABLE "nicu" DROP COLUMN "start_discharge_by"`);
        await queryRunner.query(`ALTER TABLE "nicu" DROP COLUMN "start_discharge_date"`);
        await queryRunner.query(`ALTER TABLE "nicu" DROP COLUMN "start_discharge"`);
        await queryRunner.query(`ALTER TABLE "nicu" DROP COLUMN "reason"`);
        await queryRunner.query(`ALTER TABLE "nicu" DROP COLUMN "health_state"`);
        await queryRunner.query(`ALTER TABLE "patients" ADD "is_admitted" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "nicu" ADD "admission_id" integer`);
        await queryRunner.query(`ALTER TABLE "nicu" ADD CONSTRAINT "REL_04d64f533435cc27fc6502916d" UNIQUE ("admission_id")`);
        await queryRunner.query(`ALTER TABLE "admissions" ADD "nicu_id" integer`);
        await queryRunner.query(`ALTER TABLE "admissions" ADD CONSTRAINT "REL_ead945020abc516c1503410003" UNIQUE ("nicu_id")`);
        await queryRunner.query(`ALTER TABLE "nicu" ADD CONSTRAINT "FK_04d64f533435cc27fc6502916da" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admissions" ADD CONSTRAINT "FK_ead945020abc516c15034100035" FOREIGN KEY ("nicu_id") REFERENCES "nicu"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
