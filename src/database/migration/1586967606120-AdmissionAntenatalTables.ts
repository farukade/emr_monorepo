import {MigrationInterface, QueryRunner} from "typeorm";

export class AdmissionAntenatalTables1586967606120 implements MigrationInterface {
    name = 'AdmissionAntenatalTables1586967606120'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "admission_clinical_tasks" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "task" character varying NOT NULL, "interval" integer, "intervalType" character varying, "taskCount" integer, "startTime" TIMESTAMP, "admissionId" uuid, CONSTRAINT "PK_0f4e39d62c498244852e2ecad02" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "admissions" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "healthState" character varying NOT NULL, "riskToFall" boolean NOT NULL, "reason" character varying NOT NULL, "anticipatedDischargeDate" character varying NOT NULL, "status" smallint NOT NULL DEFAULT 1, "patientId" uuid, "roomId" uuid, "pcg" uuid, CONSTRAINT "PK_6d47682a899dfa0a78ce11fe98a" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "admission_care_givers" ("id" SERIAL NOT NULL, "admissionId" uuid, "staffId" uuid, CONSTRAINT "PK_f42bf75761de230f4cc5f001956" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "antenatal_enrollments" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "bookingPeriod" character varying NOT NULL, "requiredCare" text NOT NULL, "l_m_p" character varying NOT NULL, "lmpSource" character varying NOT NULL, "e_o_d" character varying NOT NULL, "fathersInfo" text NOT NULL, "obstericsHistory" jsonb NOT NULL, "previousPregnancy" text NOT NULL, "enrollmentPackage" character varying NOT NULL, "patientId" uuid, CONSTRAINT "PK_d098a3a1d55a514717b49310f4a" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "antenatal_visits" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "heightOfFunds" character varying NOT NULL, "fetalHeartRate" character varying NOT NULL, "positionOfFetus" character varying NOT NULL, "fetalLie" character varying NOT NULL, "relationshipToBrim" character varying NOT NULL, "comment" character varying NOT NULL, "nextAppointment" TIMESTAMP NOT NULL, "patientId" uuid, "lab_request" uuid, "radiology_request" uuid, "pharmacy_request" uuid, CONSTRAINT "REL_a6370a05e34da25aa153f897ac" UNIQUE ("lab_request"), CONSTRAINT "REL_da11407529f14d3d485882182d" UNIQUE ("radiology_request"), CONSTRAINT "REL_c203386678db07754037b489c8" UNIQUE ("pharmacy_request"), CONSTRAINT "PK_82b01d2796241d80648b7fe3d42" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "admission_clinical_tasks" ADD CONSTRAINT "FK_ecedff847d155018bde71f9fb2c" FOREIGN KEY ("admissionId") REFERENCES "admissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" ADD CONSTRAINT "FK_f9d5de8d7dd020123a3c76f0a2e" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" ADD CONSTRAINT "FK_e892e10c6d41e330d59943e2659" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" ADD CONSTRAINT "FK_116636d085c212a2aa57281b806" FOREIGN KEY ("pcg") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "admission_care_givers" ADD CONSTRAINT "FK_4e947e134cbd9b50b7a64f2aef3" FOREIGN KEY ("admissionId") REFERENCES "admissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "admission_care_givers" ADD CONSTRAINT "FK_abeca5cb96a6f600a76387c4fde" FOREIGN KEY ("staffId") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ADD CONSTRAINT "FK_4fb49f23f98143d3a799c9f634d" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_visits" ADD CONSTRAINT "FK_83e30cd3e71c97df575d9516f29" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_visits" ADD CONSTRAINT "FK_a6370a05e34da25aa153f897ac0" FOREIGN KEY ("lab_request") REFERENCES "patient_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_visits" ADD CONSTRAINT "FK_da11407529f14d3d485882182d3" FOREIGN KEY ("radiology_request") REFERENCES "patient_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_visits" ADD CONSTRAINT "FK_c203386678db07754037b489c88" FOREIGN KEY ("pharmacy_request") REFERENCES "patient_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "antenatal_visits" DROP CONSTRAINT "FK_c203386678db07754037b489c88"`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_visits" DROP CONSTRAINT "FK_da11407529f14d3d485882182d3"`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_visits" DROP CONSTRAINT "FK_a6370a05e34da25aa153f897ac0"`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_visits" DROP CONSTRAINT "FK_83e30cd3e71c97df575d9516f29"`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" DROP CONSTRAINT "FK_4fb49f23f98143d3a799c9f634d"`, undefined);
        await queryRunner.query(`ALTER TABLE "admission_care_givers" DROP CONSTRAINT "FK_abeca5cb96a6f600a76387c4fde"`, undefined);
        await queryRunner.query(`ALTER TABLE "admission_care_givers" DROP CONSTRAINT "FK_4e947e134cbd9b50b7a64f2aef3"`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" DROP CONSTRAINT "FK_116636d085c212a2aa57281b806"`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" DROP CONSTRAINT "FK_e892e10c6d41e330d59943e2659"`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" DROP CONSTRAINT "FK_f9d5de8d7dd020123a3c76f0a2e"`, undefined);
        await queryRunner.query(`ALTER TABLE "admission_clinical_tasks" DROP CONSTRAINT "FK_ecedff847d155018bde71f9fb2c"`, undefined);
        await queryRunner.query(`DROP TABLE "antenatal_visits"`, undefined);
        await queryRunner.query(`DROP TABLE "antenatal_enrollments"`, undefined);
        await queryRunner.query(`DROP TABLE "admission_care_givers"`, undefined);
        await queryRunner.query(`DROP TABLE "admissions"`, undefined);
        await queryRunner.query(`DROP TABLE "admission_clinical_tasks"`, undefined);
    }

}
