import {MigrationInterface, QueryRunner} from "typeorm";

export class Immunization1598694716728 implements MigrationInterface {
    name = 'Immunization1598694716728'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "immunizations" DROP CONSTRAINT "FK_8fbe789e9830c8beb9c39de4540"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "isActive"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "prescription"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "patientId"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "createdBy"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "lastChangedBy"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "typeOfVaccine"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "dateOfAdministration"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "vaccineBatchNo"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "nextVisitDate"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "name_of_vaccine" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "slug" character varying(30) NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "description" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "date_due" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "period" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "date_administered" character varying`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "patient_id" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "staff_id" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP CONSTRAINT "PK_d6ef20ce9b42402adbbd1e260fe"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "id"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "id" SERIAL NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD CONSTRAINT "PK_d6ef20ce9b42402adbbd1e260fe" PRIMARY KEY ("id")`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD CONSTRAINT "FK_3484afecca0b55b0ac4b5fdfc12" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD CONSTRAINT "FK_bb573ed65bc71c9a57c74247c07" FOREIGN KEY ("staff_id") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "immunizations" DROP CONSTRAINT "FK_bb573ed65bc71c9a57c74247c07"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP CONSTRAINT "FK_3484afecca0b55b0ac4b5fdfc12"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP CONSTRAINT "PK_d6ef20ce9b42402adbbd1e260fe"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "id"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "id" uuid NOT NULL DEFAULT gen_random_uuid()`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD CONSTRAINT "PK_d6ef20ce9b42402adbbd1e260fe" PRIMARY KEY ("id")`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "staff_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "patient_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "date_administered"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "period"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "date_due"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "description"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "slug"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "name_of_vaccine"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "nextVisitDate" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "vaccineBatchNo" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "dateOfAdministration" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "typeOfVaccine" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "lastChangedBy" character varying(300)`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "createdBy" character varying(300)`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "patientId" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "prescription" jsonb`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "isActive" boolean NOT NULL DEFAULT true`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD CONSTRAINT "FK_8fbe789e9830c8beb9c39de4540" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

}
