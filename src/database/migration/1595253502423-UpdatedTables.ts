import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdatedTables1595253502423 implements MigrationInterface {
    name = 'UpdatedTables1595253502423'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "ivf_down_regulation_charts" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "agent" character varying NOT NULL, "cycle" character varying NOT NULL, "charts" text NOT NULL, "ivf_enrollment_id" uuid, CONSTRAINT "REL_b425d06881bec00c9bcb24c85e" UNIQUE ("ivf_enrollment_id"), CONSTRAINT "PK_1ff022b832acdb044e8c3ef06cd" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "ivf_hcg_administration_charts" ("id" SERIAL NOT NULL, "timeOfEntry" character varying NOT NULL, "timeOfAdmin" character varying NOT NULL, "typeOfHcg" character varying NOT NULL, "typeOfDosage" character varying NOT NULL, "routeOfAdmin" character varying NOT NULL, "remarks" character varying NOT NULL, "ivf_enrollment_id" uuid, "patient_id" uuid, "staff_id" uuid, CONSTRAINT "PK_d211d278d4f8dd639c991f14bb3" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "ivf_theatre_procedure_lists" ("id" SERIAL NOT NULL, "procedure" character varying NOT NULL, "folicile" character varying NOT NULL, "schedule" character varying NOT NULL, "remarks" character varying NOT NULL, "ivf_enrollment_id" uuid, "patient_id" uuid, "staff_id" uuid, CONSTRAINT "PK_90964579aa1bcf8c8be5b3f4d1d" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "patient_requests" ADD "isFilled" boolean NOT NULL DEFAULT false`, undefined);
        await queryRunner.query(`ALTER TABLE "queues" DROP COLUMN "createdAt"`, undefined);
        await queryRunner.query(`ALTER TABLE "queues" ADD "createdAt" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "ivf_down_regulation_charts" ADD CONSTRAINT "FK_b425d06881bec00c9bcb24c85ee" FOREIGN KEY ("ivf_enrollment_id") REFERENCES "ivf_enrollments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "ivf_hcg_administration_charts" ADD CONSTRAINT "FK_c735c44f8157c85ee46ba8a6495" FOREIGN KEY ("ivf_enrollment_id") REFERENCES "ivf_enrollments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "ivf_hcg_administration_charts" ADD CONSTRAINT "FK_334128c19b03726e9ce3064e79a" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "ivf_hcg_administration_charts" ADD CONSTRAINT "FK_45e154067dbb8479225d68b5a9d" FOREIGN KEY ("staff_id") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "ivf_theatre_procedure_lists" ADD CONSTRAINT "FK_5cbbba8e7407a82335eeee2b042" FOREIGN KEY ("ivf_enrollment_id") REFERENCES "ivf_enrollments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "ivf_theatre_procedure_lists" ADD CONSTRAINT "FK_25d299db571c235e738a77f5feb" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "ivf_theatre_procedure_lists" ADD CONSTRAINT "FK_cb716ac7f1e01a63f7094df8d3c" FOREIGN KEY ("staff_id") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "ivf_theatre_procedure_lists" DROP CONSTRAINT "FK_cb716ac7f1e01a63f7094df8d3c"`, undefined);
        await queryRunner.query(`ALTER TABLE "ivf_theatre_procedure_lists" DROP CONSTRAINT "FK_25d299db571c235e738a77f5feb"`, undefined);
        await queryRunner.query(`ALTER TABLE "ivf_theatre_procedure_lists" DROP CONSTRAINT "FK_5cbbba8e7407a82335eeee2b042"`, undefined);
        await queryRunner.query(`ALTER TABLE "ivf_hcg_administration_charts" DROP CONSTRAINT "FK_45e154067dbb8479225d68b5a9d"`, undefined);
        await queryRunner.query(`ALTER TABLE "ivf_hcg_administration_charts" DROP CONSTRAINT "FK_334128c19b03726e9ce3064e79a"`, undefined);
        await queryRunner.query(`ALTER TABLE "ivf_hcg_administration_charts" DROP CONSTRAINT "FK_c735c44f8157c85ee46ba8a6495"`, undefined);
        await queryRunner.query(`ALTER TABLE "ivf_down_regulation_charts" DROP CONSTRAINT "FK_b425d06881bec00c9bcb24c85ee"`, undefined);
        await queryRunner.query(`ALTER TABLE "queues" DROP COLUMN "createdAt"`, undefined);
        await queryRunner.query(`ALTER TABLE "queues" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`, undefined);
        await queryRunner.query(`ALTER TABLE "patient_requests" DROP COLUMN "isFilled"`, undefined);
        await queryRunner.query(`DROP TABLE "ivf_theatre_procedure_lists"`, undefined);
        await queryRunner.query(`DROP TABLE "ivf_hcg_administration_charts"`, undefined);
        await queryRunner.query(`DROP TABLE "ivf_down_regulation_charts"`, undefined);
    }

}
