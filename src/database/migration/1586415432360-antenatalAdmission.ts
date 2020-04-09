import {MigrationInterface, QueryRunner} from "typeorm";

export class antenatalAdmission1586415432360 implements MigrationInterface {
    name = 'antenatalAdmission1586415432360'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "admissions" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "task" character varying NOT NULL, "interval" integer NOT NULL, "intervalType" character varying NOT NULL, "taskCount" integer NOT NULL, "startTime" TIMESTAMP, "admissionId" uuid, CONSTRAINT "PK_6d47682a899dfa0a78ce11fe98a" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "admission_care_givers" ("id" SERIAL NOT NULL, "admissionId" uuid, "staffId" uuid, CONSTRAINT "PK_f42bf75761de230f4cc5f001956" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "antenatal_enrollments" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "bookingPeriod" character varying NOT NULL, "requiredCare" text NOT NULL, "l_m_p" character varying NOT NULL, "lmpSource" character varying NOT NULL, "e_o_d" character varying NOT NULL, "fathersInfo" text NOT NULL, "obstericsHistory" character varying NOT NULL, "previousPregnancy" text NOT NULL, "enrollmentPackage" character varying NOT NULL, "patientId" uuid, CONSTRAINT "PK_d098a3a1d55a514717b49310f4a" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "task"`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "interval"`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "intervalType"`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "taskCount"`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "startTime"`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "admissionId"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "transaction_details" jsonb`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" ADD "task" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" ADD "interval" integer NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" ADD "intervalType" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" ADD "taskCount" integer NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" ADD "startTime" TIMESTAMP`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" ADD "admissionId" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" ADD "healthState" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" ADD "riskToFall" boolean NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" ADD "reason" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" ADD "anticipatedDischargeDate" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" ADD "status" smallint NOT NULL DEFAULT 1`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" ADD "patientId" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" ADD "roomId" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" ADD "pcg" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" ADD CONSTRAINT "FK_dad9d684a91a65c167aec0ed51f" FOREIGN KEY ("admissionId") REFERENCES "admissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" ADD CONSTRAINT "FK_f9d5de8d7dd020123a3c76f0a2e" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" ADD CONSTRAINT "FK_e892e10c6d41e330d59943e2659" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" ADD CONSTRAINT "FK_116636d085c212a2aa57281b806" FOREIGN KEY ("pcg") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "admission_care_givers" ADD CONSTRAINT "FK_4e947e134cbd9b50b7a64f2aef3" FOREIGN KEY ("admissionId") REFERENCES "admissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "admission_care_givers" ADD CONSTRAINT "FK_abeca5cb96a6f600a76387c4fde" FOREIGN KEY ("staffId") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ADD CONSTRAINT "FK_4fb49f23f98143d3a799c9f634d" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" DROP CONSTRAINT "FK_4fb49f23f98143d3a799c9f634d"`, undefined);
        await queryRunner.query(`ALTER TABLE "admission_care_givers" DROP CONSTRAINT "FK_abeca5cb96a6f600a76387c4fde"`, undefined);
        await queryRunner.query(`ALTER TABLE "admission_care_givers" DROP CONSTRAINT "FK_4e947e134cbd9b50b7a64f2aef3"`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" DROP CONSTRAINT "FK_116636d085c212a2aa57281b806"`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" DROP CONSTRAINT "FK_e892e10c6d41e330d59943e2659"`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" DROP CONSTRAINT "FK_f9d5de8d7dd020123a3c76f0a2e"`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" DROP CONSTRAINT "FK_dad9d684a91a65c167aec0ed51f"`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "pcg"`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "roomId"`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "patientId"`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "status"`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "anticipatedDischargeDate"`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "reason"`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "riskToFall"`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "healthState"`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "admissionId"`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "startTime"`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "taskCount"`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "intervalType"`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "interval"`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "task"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "transaction_details"`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" ADD "admissionId" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" ADD "startTime" TIMESTAMP`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" ADD "taskCount" integer NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" ADD "intervalType" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" ADD "interval" integer NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" ADD "task" character varying NOT NULL`, undefined);
        await queryRunner.query(`DROP TABLE "antenatal_enrollments"`, undefined);
        await queryRunner.query(`DROP TABLE "admission_care_givers"`, undefined);
        await queryRunner.query(`DROP TABLE "admissions"`, undefined);
    }

}
