import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdatedTable1589016746898 implements MigrationInterface {
    name = 'UpdatedTable1589016746898'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "encounters" DROP CONSTRAINT "FK_79528cb799cc63dadd8895fd9b7"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP CONSTRAINT "FK_61d7611a612fc2c4c86af509e35"`, undefined);
        await queryRunner.query(`ALTER TABLE "encounters" DROP COLUMN "procedure"`, undefined);
        await queryRunner.query(`ALTER TABLE "encounters" DROP COLUMN "patientId"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "husbandName"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "husbandPhoneNo"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "bloodGroup"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "parity"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "alive"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "miscarriage"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "presentPregnancy"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "lmp"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "typeOfVaccine"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "dateOfAdministration"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "vaccineBatchNo"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "prescription"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "nextVisitDate"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "administeredBy"`, undefined);
        await queryRunner.query(`ALTER TABLE "leave_applications" ADD "diagnosis_id" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "encounters" ADD "procedure" text`, undefined);
        await queryRunner.query(`ALTER TABLE "encounters" ADD "patientId" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "typeOfVaccine" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "dateOfAdministration" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "vaccineBatchNo" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "prescription" jsonb`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "nextVisitDate" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "administeredBy" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "husbandName" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "husbandPhoneNo" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "bloodGroup" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "parity" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "alive" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "miscarriage" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "presentPregnancy" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "lmp" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "leave_applications" ADD CONSTRAINT "FK_2e8747d95147365b998a6804fb6" FOREIGN KEY ("diagnosis_id") REFERENCES "diagnosis"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "encounters" ADD CONSTRAINT "FK_79528cb799cc63dadd8895fd9b7" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD CONSTRAINT "FK_61d7611a612fc2c4c86af509e35" FOREIGN KEY ("administeredBy") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "immunizations" DROP CONSTRAINT "FK_61d7611a612fc2c4c86af509e35"`, undefined);
        await queryRunner.query(`ALTER TABLE "encounters" DROP CONSTRAINT "FK_79528cb799cc63dadd8895fd9b7"`, undefined);
        await queryRunner.query(`ALTER TABLE "leave_applications" DROP CONSTRAINT "FK_2e8747d95147365b998a6804fb6"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "lmp"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "presentPregnancy"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "miscarriage"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "alive"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "parity"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "bloodGroup"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "husbandPhoneNo"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "husbandName"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "administeredBy"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "nextVisitDate"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "prescription"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "vaccineBatchNo"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "dateOfAdministration"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "typeOfVaccine"`, undefined);
        await queryRunner.query(`ALTER TABLE "encounters" DROP COLUMN "patientId"`, undefined);
        await queryRunner.query(`ALTER TABLE "encounters" DROP COLUMN "procedure"`, undefined);
        await queryRunner.query(`ALTER TABLE "leave_applications" DROP COLUMN "diagnosis_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "administeredBy" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "nextVisitDate" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "prescription" jsonb`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "vaccineBatchNo" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "dateOfAdministration" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "typeOfVaccine" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "lmp" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "presentPregnancy" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "miscarriage" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "alive" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "parity" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "bloodGroup" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "husbandPhoneNo" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "husbandName" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "encounters" ADD "patientId" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "encounters" ADD "procedure" text`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD CONSTRAINT "FK_61d7611a612fc2c4c86af509e35" FOREIGN KEY ("administeredBy") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "encounters" ADD CONSTRAINT "FK_79528cb799cc63dadd8895fd9b7" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

}
