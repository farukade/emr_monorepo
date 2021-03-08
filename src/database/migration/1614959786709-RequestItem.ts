import {MigrationInterface, QueryRunner} from "typeorm";

export class RequestItem1614959786709 implements MigrationInterface {
    name = 'RequestItem1614959786709'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" DROP CONSTRAINT "FK_4fb49f23f98143d3a799c9f634d"`);
        await queryRunner.query(`ALTER TABLE "labour_delivery_records" DROP CONSTRAINT "FK_d909f076e17cec09d6cbb7a9d9d"`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" DROP CONSTRAINT "FK_6803a1e2c5fb855dcfa3695ff80"`);
        await queryRunner.query(`ALTER TABLE "labour_risk_assessments" DROP CONSTRAINT "FK_9d7546e360442860d77ba9c4f4d"`);
        await queryRunner.query(`ALTER TABLE "labour_vitals" DROP CONSTRAINT "FK_2db4eb4d026523c75959c0c8f00"`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" RENAME COLUMN "patientId" TO "patient_id"`);
        await queryRunner.query(`ALTER TABLE "labour_delivery_records" RENAME COLUMN "enrollementId" TO "enrollment_id"`);
        await queryRunner.query(`ALTER TABLE "labour_risk_assessments" RENAME COLUMN "enrollementId" TO "enrollment_id"`);
        await queryRunner.query(`CREATE TABLE "labour_enrollments" ("id" SERIAL NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdBy" character varying(300), "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "husbandName" character varying NOT NULL, "husbandPhoneNo" character varying NOT NULL, "bloodGroup" character varying, "parity" character varying, "alive" character varying, "miscarriage" character varying, "presentPregnancy" character varying, "lmp" character varying, "patient_id" integer, CONSTRAINT "PK_5eb5ea3dba20c7c73b2ca4623f7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" DROP COLUMN "positionOfFestus"`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" DROP COLUMN "membrances"`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" DROP COLUMN "labTests"`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" ADD "forIVF" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "ivf_enrollments" ADD "labTests" text`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" ADD "positionOfFoetus" character varying`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" ADD "membranes" character varying`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" ADD "request_id" integer`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" ADD CONSTRAINT "UQ_a0fc19ad7467974fc103fbfeb69" UNIQUE ("request_id")`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ADD CONSTRAINT "FK_9075ea15746fb99130995307308" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "labour_enrollments" ADD CONSTRAINT "FK_5c01da9a9efb9a65bccc278ae73" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "labour_delivery_records" ADD CONSTRAINT "FK_44bfbc4958da858698eccb9695e" FOREIGN KEY ("enrollment_id") REFERENCES "labour_enrollments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" ADD CONSTRAINT "FK_6803a1e2c5fb855dcfa3695ff80" FOREIGN KEY ("enrollmentId") REFERENCES "labour_enrollments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" ADD CONSTRAINT "FK_a0fc19ad7467974fc103fbfeb69" FOREIGN KEY ("request_id") REFERENCES "patient_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "labour_risk_assessments" ADD CONSTRAINT "FK_4b25904afc8da612e897673c2ce" FOREIGN KEY ("enrollment_id") REFERENCES "labour_enrollments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "labour_vitals" ADD CONSTRAINT "FK_2db4eb4d026523c75959c0c8f00" FOREIGN KEY ("enrollementId") REFERENCES "labour_enrollments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "labour_vitals" DROP CONSTRAINT "FK_2db4eb4d026523c75959c0c8f00"`);
        await queryRunner.query(`ALTER TABLE "labour_risk_assessments" DROP CONSTRAINT "FK_4b25904afc8da612e897673c2ce"`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" DROP CONSTRAINT "FK_a0fc19ad7467974fc103fbfeb69"`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" DROP CONSTRAINT "FK_6803a1e2c5fb855dcfa3695ff80"`);
        await queryRunner.query(`ALTER TABLE "labour_delivery_records" DROP CONSTRAINT "FK_44bfbc4958da858698eccb9695e"`);
        await queryRunner.query(`ALTER TABLE "labour_enrollments" DROP CONSTRAINT "FK_5c01da9a9efb9a65bccc278ae73"`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" DROP CONSTRAINT "FK_9075ea15746fb99130995307308"`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" DROP CONSTRAINT "UQ_a0fc19ad7467974fc103fbfeb69"`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" DROP COLUMN "request_id"`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" DROP COLUMN "membranes"`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" DROP COLUMN "positionOfFoetus"`);
        await queryRunner.query(`ALTER TABLE "ivf_enrollments" DROP COLUMN "labTests"`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" DROP COLUMN "forIVF"`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" ADD "labTests" text`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" ADD "membrances" character varying`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" ADD "positionOfFestus" character varying`);
        await queryRunner.query(`DROP TABLE "labour_enrollments"`);
        await queryRunner.query(`ALTER TABLE "labour_risk_assessments" RENAME COLUMN "enrollment_id" TO "enrollementId"`);
        await queryRunner.query(`ALTER TABLE "labour_delivery_records" RENAME COLUMN "enrollment_id" TO "enrollementId"`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" RENAME COLUMN "patient_id" TO "patientId"`);
        await queryRunner.query(`ALTER TABLE "labour_vitals" ADD CONSTRAINT "FK_2db4eb4d026523c75959c0c8f00" FOREIGN KEY ("enrollementId") REFERENCES "labour_enrollemnts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "labour_risk_assessments" ADD CONSTRAINT "FK_9d7546e360442860d77ba9c4f4d" FOREIGN KEY ("enrollementId") REFERENCES "labour_enrollemnts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" ADD CONSTRAINT "FK_6803a1e2c5fb855dcfa3695ff80" FOREIGN KEY ("enrollmentId") REFERENCES "labour_enrollemnts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "labour_delivery_records" ADD CONSTRAINT "FK_d909f076e17cec09d6cbb7a9d9d" FOREIGN KEY ("enrollementId") REFERENCES "labour_enrollemnts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ADD CONSTRAINT "FK_4fb49f23f98143d3a799c9f634d" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
