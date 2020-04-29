import {MigrationInterface, QueryRunner} from "typeorm";

export class TableUpdate1588167396446 implements MigrationInterface {
    name = 'TableUpdate1588167396446'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "encounters" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "complaints" text NOT NULL, "reviewOfSystem" text, "patientHistory" text, "medicalHistory" text, "allergies" text, "physicalExamination" text, "physicalExaminationSummary" text, "diagnosis" text, "investigations" text, "plan" text, "nextAppointment" text, "consumable" text, "note" text, "instructions" text, CONSTRAINT "PK_b2e596be58aabc4ccc8f8458b53" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "encounters" ADD "procedure" text`, undefined);
        await queryRunner.query(`ALTER TABLE "encounters" ADD "patientId" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "stocks" DROP CONSTRAINT "UQ_be76e0167630fb8261f3bbf81f1"`, undefined);
        await queryRunner.query(`ALTER TABLE "encounters" ADD CONSTRAINT "FK_79528cb799cc63dadd8895fd9b7" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "encounters" DROP CONSTRAINT "FK_79528cb799cc63dadd8895fd9b7"`, undefined);
        await queryRunner.query(`ALTER TABLE "stocks" ADD CONSTRAINT "UQ_be76e0167630fb8261f3bbf81f1" UNIQUE ("generic_name")`, undefined);
        await queryRunner.query(`ALTER TABLE "encounters" DROP COLUMN "patientId"`, undefined);
        await queryRunner.query(`ALTER TABLE "encounters" DROP COLUMN "procedure"`, undefined);
        await queryRunner.query(`DROP TABLE "encounters"`, undefined);
    }

}
