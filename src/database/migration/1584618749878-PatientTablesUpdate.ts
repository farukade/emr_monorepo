import {MigrationInterface, QueryRunner} from "typeorm";

export class PatientTablesUpdate1584618749878 implements MigrationInterface {
    name = 'PatientTablesUpdate1584618749878'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "supervisor_evaluation_reports" RENAME COLUMN "topic" TO "periodId"`, undefined);
        await queryRunner.query(`CREATE TABLE "patient_allergies" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "category" character varying NOT NULL, "allergy" character varying NOT NULL, "severity" character varying NOT NULL, "reaction" character varying NOT NULL, "patientId" uuid, CONSTRAINT "PK_3ad7c82be25564a47df337045f8" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "patient_antenatals" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "heightOfFunds" character varying NOT NULL, "fetalHeartRate" character varying NOT NULL, "positionOfFetus" character varying NOT NULL, "fetalLie" character varying NOT NULL, "relationshipToBrim" character varying NOT NULL, "patientId" uuid, CONSTRAINT "PK_15429cae09877b568f8edbd4acf" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "patient_vitals" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "readingType" character varying NOT NULL, "reading" jsonb NOT NULL, "patientId" uuid, CONSTRAINT "PK_1b394dd3e5e406c4c8f7dc914ac" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "patients" ADD "lastAppointmentDate" character varying`, undefined);
        await queryRunner.query(`ALTER TABLE "patients" ADD "noOfVisits" integer DEFAULT 0`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "noOfVisits"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD "noOfVisits" integer`, undefined);
        await queryRunner.query(`ALTER TABLE "supervisor_evaluation_reports" DROP COLUMN "periodId"`, undefined);
        await queryRunner.query(`ALTER TABLE "supervisor_evaluation_reports" ADD "periodId" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "supervisor_evaluation_reports" ADD CONSTRAINT "FK_49aba038e939535b818d8d6b999" FOREIGN KEY ("periodId") REFERENCES "performance_appraisal_periods"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "patient_allergies" ADD CONSTRAINT "FK_6f475d246eec23c35096beb4883" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "patient_antenatals" ADD CONSTRAINT "FK_03586924a79d943987663167a5b" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "patient_vitals" ADD CONSTRAINT "FK_7257554c15e05eda150bd180c2b" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "patient_vitals" DROP CONSTRAINT "FK_7257554c15e05eda150bd180c2b"`, undefined);
        await queryRunner.query(`ALTER TABLE "patient_antenatals" DROP CONSTRAINT "FK_03586924a79d943987663167a5b"`, undefined);
        await queryRunner.query(`ALTER TABLE "patient_allergies" DROP CONSTRAINT "FK_6f475d246eec23c35096beb4883"`, undefined);
        await queryRunner.query(`ALTER TABLE "supervisor_evaluation_reports" DROP CONSTRAINT "FK_49aba038e939535b818d8d6b999"`, undefined);
        await queryRunner.query(`ALTER TABLE "supervisor_evaluation_reports" DROP COLUMN "periodId"`, undefined);
        await queryRunner.query(`ALTER TABLE "supervisor_evaluation_reports" ADD "periodId" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "noOfVisits"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD "noOfVisits" character varying(300)`, undefined);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "noOfVisits"`, undefined);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "lastAppointmentDate"`, undefined);
        await queryRunner.query(`DROP TABLE "patient_vitals"`, undefined);
        await queryRunner.query(`DROP TABLE "patient_antenatals"`, undefined);
        await queryRunner.query(`DROP TABLE "patient_allergies"`, undefined);
        await queryRunner.query(`ALTER TABLE "supervisor_evaluation_reports" RENAME COLUMN "periodId" TO "topic"`, undefined);
    }

}
