import {MigrationInterface, QueryRunner} from "typeorm";

export class AntenatalAssessment1635733508553 implements MigrationInterface {
    name = 'AntenatalAssessment1635733508553'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" RENAME COLUMN "amountToPay" TO "duration_type"`);
        await queryRunner.query(`CREATE TABLE "antenatal_assessments" ("id" SERIAL NOT NULL, "old_id" character varying, "createdBy" character varying(300) NOT NULL DEFAULT 'it-admin', "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "measurement" jsonb NOT NULL, "position_of_foetus" character varying, "fetal_lie" character varying, "relationship_to_brim" character varying, "antenatal_enrollment_id" integer, "patient_id" integer, "note_id" integer, CONSTRAINT "REL_813b966256226378a2bc125951" UNIQUE ("antenatal_enrollment_id"), CONSTRAINT "PK_c469532deeedcb818b060d00a81" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "duration_type"`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "duration_type" character varying`);
        await queryRunner.query(`ALTER TABLE "antenatal_assessments" ADD CONSTRAINT "FK_813b966256226378a2bc1259511" FOREIGN KEY ("antenatal_enrollment_id") REFERENCES "antenatal_enrollments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "antenatal_assessments" ADD CONSTRAINT "FK_e0e10af07c931ad0582eb827122" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "antenatal_assessments" ADD CONSTRAINT "FK_90f2bc34f2a5f7fb988f143888b" FOREIGN KEY ("note_id") REFERENCES "patient_notes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "antenatal_assessments" DROP CONSTRAINT "FK_90f2bc34f2a5f7fb988f143888b"`);
        await queryRunner.query(`ALTER TABLE "antenatal_assessments" DROP CONSTRAINT "FK_e0e10af07c931ad0582eb827122"`);
        await queryRunner.query(`ALTER TABLE "antenatal_assessments" DROP CONSTRAINT "FK_813b966256226378a2bc1259511"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "duration_type"`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "duration_type" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`DROP TABLE "antenatal_assessments"`);
        await queryRunner.query(`ALTER TABLE "appointments" RENAME COLUMN "duration_type" TO "amountToPay"`);
    }

}
