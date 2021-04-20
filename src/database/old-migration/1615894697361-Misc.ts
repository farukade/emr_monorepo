import {MigrationInterface, QueryRunner} from "typeorm";

export class Misc1615894697361 implements MigrationInterface {
    name = 'Misc1615894697361'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_037e8a51b3dd187b96ce20f906a"`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" DROP CONSTRAINT "FK_4fb49f23f98143d3a799c9f634d"`);
        await queryRunner.query(`ALTER TABLE "labour_enrollments" DROP CONSTRAINT "FK_26136e00620d83106f57c87149c"`);
        await queryRunner.query(`ALTER TABLE "labour_delivery_records" DROP CONSTRAINT "FK_d909f076e17cec09d6cbb7a9d9d"`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" DROP CONSTRAINT "FK_fde2037d9915be7816cfce60295"`);
        await queryRunner.query(`ALTER TABLE "labour_risk_assessments" DROP CONSTRAINT "FK_9d7546e360442860d77ba9c4f4d"`);
        await queryRunner.query(`ALTER TABLE "labour_vitals" DROP CONSTRAINT "FK_2db4eb4d026523c75959c0c8f00"`);
        await queryRunner.query(`ALTER TABLE "transactions" RENAME COLUMN "patient_request_id" TO "patient_request_item_id"`);
        await queryRunner.query(`ALTER TABLE "transactions" RENAME CONSTRAINT "REL_037e8a51b3dd187b96ce20f906" TO "UQ_75f8e75a828cb64ea9016e52732"`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" RENAME COLUMN "patientId" TO "patient_id"`);
        await queryRunner.query(`ALTER TABLE "labour_delivery_records" RENAME COLUMN "enrollmentId" TO "enrollment_id"`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" RENAME COLUMN "labTests" TO "request_id"`);
        await queryRunner.query(`ALTER TABLE "labour_risk_assessments" RENAME COLUMN "enrollmentId" TO "enrollment_id"`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" DROP COLUMN "request_id"`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" ADD "request_id" integer`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" ADD CONSTRAINT "UQ_a0fc19ad7467974fc103fbfeb69" UNIQUE ("request_id")`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" ADD CONSTRAINT "FK_a4fa7f03aee8fa57de0a2a4cb08" FOREIGN KEY ("request_id") REFERENCES "patient_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" ADD CONSTRAINT "FK_cbed537706bbf99bcd4fb65598c" FOREIGN KEY ("lab_test_id") REFERENCES "lab_tests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" ADD CONSTRAINT "FK_6d66a27b72d34e216e1ab8e8b5b" FOREIGN KEY ("drug_id") REFERENCES "stocks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" ADD CONSTRAINT "FK_2b7ae8c84df71bdbe91812e712f" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_75f8e75a828cb64ea9016e52732" FOREIGN KEY ("patient_request_item_id") REFERENCES "patient_request_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ADD CONSTRAINT "FK_9075ea15746fb99130995307308" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "labour_enrollments" ADD CONSTRAINT "FK_5c01da9a9efb9a65bccc278ae73" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "labour_delivery_records" ADD CONSTRAINT "FK_44bfbc4958da858698eccb9695e" FOREIGN KEY ("enrollment_id") REFERENCES "labour_enrollments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" ADD CONSTRAINT "FK_6803a1e2c5fb855dcfa3695ff80" FOREIGN KEY ("enrollmentId") REFERENCES "labour_enrollments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" ADD CONSTRAINT "FK_a0fc19ad7467974fc103fbfeb69" FOREIGN KEY ("request_id") REFERENCES "patient_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "labour_risk_assessments" ADD CONSTRAINT "FK_4b25904afc8da612e897673c2ce" FOREIGN KEY ("enrollment_id") REFERENCES "labour_enrollments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "labour_vitals" ADD CONSTRAINT "FK_af7a15ffdba15984575b5c9de61" FOREIGN KEY ("enrollmentId") REFERENCES "labour_enrollments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "labour_vitals" DROP CONSTRAINT "FK_af7a15ffdba15984575b5c9de61"`);
        await queryRunner.query(`ALTER TABLE "labour_risk_assessments" DROP CONSTRAINT "FK_4b25904afc8da612e897673c2ce"`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" DROP CONSTRAINT "FK_a0fc19ad7467974fc103fbfeb69"`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" DROP CONSTRAINT "FK_6803a1e2c5fb855dcfa3695ff80"`);
        await queryRunner.query(`ALTER TABLE "labour_delivery_records" DROP CONSTRAINT "FK_44bfbc4958da858698eccb9695e"`);
        await queryRunner.query(`ALTER TABLE "labour_enrollments" DROP CONSTRAINT "FK_5c01da9a9efb9a65bccc278ae73"`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" DROP CONSTRAINT "FK_9075ea15746fb99130995307308"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_75f8e75a828cb64ea9016e52732"`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" DROP CONSTRAINT "FK_2b7ae8c84df71bdbe91812e712f"`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" DROP CONSTRAINT "FK_6d66a27b72d34e216e1ab8e8b5b"`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" DROP CONSTRAINT "FK_cbed537706bbf99bcd4fb65598c"`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" DROP CONSTRAINT "FK_a4fa7f03aee8fa57de0a2a4cb08"`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" DROP CONSTRAINT "UQ_a0fc19ad7467974fc103fbfeb69"`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" DROP COLUMN "request_id"`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" ADD "request_id" text`);
        await queryRunner.query(`ALTER TABLE "labour_risk_assessments" RENAME COLUMN "enrollment_id" TO "enrollmentId"`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" RENAME COLUMN "request_id" TO "labTests"`);
        await queryRunner.query(`ALTER TABLE "labour_delivery_records" RENAME COLUMN "enrollment_id" TO "enrollmentId"`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" RENAME COLUMN "patient_id" TO "patientId"`);
        await queryRunner.query(`ALTER TABLE "transactions" RENAME CONSTRAINT "UQ_75f8e75a828cb64ea9016e52732" TO "REL_037e8a51b3dd187b96ce20f906"`);
        await queryRunner.query(`ALTER TABLE "transactions" RENAME COLUMN "patient_request_item_id" TO "patient_request_id"`);
        await queryRunner.query(`ALTER TABLE "labour_vitals" ADD CONSTRAINT "FK_2db4eb4d026523c75959c0c8f00" FOREIGN KEY ("enrollmentId") REFERENCES "labour_enrollments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "labour_risk_assessments" ADD CONSTRAINT "FK_9d7546e360442860d77ba9c4f4d" FOREIGN KEY ("enrollmentId") REFERENCES "labour_enrollments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" ADD CONSTRAINT "FK_fde2037d9915be7816cfce60295" FOREIGN KEY ("enrollmentId") REFERENCES "labour_enrollments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "labour_delivery_records" ADD CONSTRAINT "FK_d909f076e17cec09d6cbb7a9d9d" FOREIGN KEY ("enrollmentId") REFERENCES "labour_enrollments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "labour_enrollments" ADD CONSTRAINT "FK_26136e00620d83106f57c87149c" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ADD CONSTRAINT "FK_4fb49f23f98143d3a799c9f634d" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_037e8a51b3dd187b96ce20f906a" FOREIGN KEY ("patient_request_id") REFERENCES "patient_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
