import {MigrationInterface, QueryRunner} from "typeorm";

export class Encounter1618563809000 implements MigrationInterface {
    name = 'Encounter1618563809000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "encounters" DROP CONSTRAINT "FK_79528cb799cc63dadd8895fd9b7"`);
        await queryRunner.query(`CREATE TABLE "patient_diagnoses" ("id" SERIAL NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdBy" character varying(300), "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "item" jsonb NOT NULL, "status" character varying NOT NULL DEFAULT 'Active', "patient_id" integer, "patient_request_item_id" integer, "encounter_id" integer, CONSTRAINT "PK_4840cadfc6414a7abe0b84c437b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "consumables" ("id" SERIAL NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdBy" character varying(300), "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "name" character varying NOT NULL, "description" character varying, CONSTRAINT "PK_88ce43ef80ea7ac74b91dbd8614" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "patient_consumables" ("id" SERIAL NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdBy" character varying(300), "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "requestNote" character varying, "consumable_id" integer, "patient_id" integer, "encounter_id" integer, CONSTRAINT "PK_be4de03ccf6e3064c02aea9edee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "patient_allergens" ("id" SERIAL NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdBy" character varying(300), "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "category" character varying NOT NULL, "allergy" character varying NOT NULL, "severity" character varying NOT NULL, "reaction" character varying NOT NULL, "drug_id" integer, "patient_id" integer, "encounter_id" integer, CONSTRAINT "PK_7d71d2ae4a0a9ce8ae71ab3c63e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "patient_notes" ("id" SERIAL NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdBy" character varying(300), "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "description" text NOT NULL, "type" character varying NOT NULL, "patient_id" integer, "encounter_id" integer, CONSTRAINT "PK_dc96e9d72e43bd35a91edf5af4f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "patient_physical_exams" ("id" SERIAL NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdBy" character varying(300), "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "category" character varying NOT NULL, "description" jsonb, "patient_id" integer, "encounter_id" integer, "antenatal_id" integer, CONSTRAINT "PK_48c8633808bb3b67029390cacfd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "patient_histories" ("id" SERIAL NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdBy" character varying(300), "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "category" character varying NOT NULL, "description" jsonb, "patient_id" integer, "encounter_id" integer, "antenatal_id" integer, CONSTRAINT "PK_80c64626700434b37915398b4e8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "patient_past_diagnoses" ("id" SERIAL NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdBy" character varying(300), "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "item" jsonb NOT NULL, "comment" character varying, "diagnosed_at" date, "patient_id" integer, "encounter_id" integer, CONSTRAINT "PK_b9c423f9102dd988fd4ae3bac3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "antenatal_packages" ("id" SERIAL NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdBy" character varying(300), "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "name" character varying(300) NOT NULL, "description" character varying(300), "amount" real NOT NULL, CONSTRAINT "PK_a7f591935ffdcf0d2f5e005d82e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "encounters" DROP COLUMN "physicalExamination"`);
        await queryRunner.query(`ALTER TABLE "encounters" DROP COLUMN "labRequest"`);
        await queryRunner.query(`ALTER TABLE "encounters" DROP COLUMN "patientId"`);
        await queryRunner.query(`ALTER TABLE "encounters" DROP COLUMN "complaints"`);
        await queryRunner.query(`ALTER TABLE "encounters" DROP COLUMN "reviewOfSystem"`);
        await queryRunner.query(`ALTER TABLE "encounters" DROP COLUMN "patientHistory"`);
        await queryRunner.query(`ALTER TABLE "encounters" DROP COLUMN "medicalHistory"`);
        await queryRunner.query(`ALTER TABLE "encounters" DROP COLUMN "allergies"`);
        await queryRunner.query(`ALTER TABLE "encounters" DROP COLUMN "physicalExaminationSummary"`);
        await queryRunner.query(`ALTER TABLE "encounters" DROP COLUMN "diagnosis"`);
        await queryRunner.query(`ALTER TABLE "encounters" DROP COLUMN "plan"`);
        await queryRunner.query(`ALTER TABLE "encounters" DROP COLUMN "nextAppointment"`);
        await queryRunner.query(`ALTER TABLE "encounters" DROP COLUMN "consumable"`);
        await queryRunner.query(`ALTER TABLE "encounters" DROP COLUMN "note"`);
        await queryRunner.query(`ALTER TABLE "encounters" DROP COLUMN "instructions"`);
        await queryRunner.query(`ALTER TABLE "patient_requests" ADD "encounter_id" integer`);
        await queryRunner.query(`ALTER TABLE "encounters" ADD "patient_id" integer`);
        await queryRunner.query(`ALTER TABLE "patients" ADD "deceased" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "patient_diagnoses" ADD CONSTRAINT "FK_582613321ed8d049a913b70c396" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_diagnoses" ADD CONSTRAINT "FK_3fe6405eb70abf1739b1047b720" FOREIGN KEY ("patient_request_item_id") REFERENCES "patient_request_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_diagnoses" ADD CONSTRAINT "FK_90015378ee939224fbf818ad0d6" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_requests" ADD CONSTRAINT "FK_63ab0933c7240bfb6f262565c55" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_consumables" ADD CONSTRAINT "FK_22a7741e736c9b6d6e2546d5b86" FOREIGN KEY ("consumable_id") REFERENCES "consumables"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_consumables" ADD CONSTRAINT "FK_c91fb05f0f00ab6b05955f986ec" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_consumables" ADD CONSTRAINT "FK_6d48a7236b898c613e88c7c7c14" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_allergens" ADD CONSTRAINT "FK_62ccff26bb8e02223dc4ce3bb89" FOREIGN KEY ("drug_id") REFERENCES "stocks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_allergens" ADD CONSTRAINT "FK_659928394a82ec93946e391e465" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_allergens" ADD CONSTRAINT "FK_61e4c3b1516ba66904e4152b7e6" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_notes" ADD CONSTRAINT "FK_3a88b654dceb39a4986d1fefdad" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_notes" ADD CONSTRAINT "FK_a929625dc2c0740b3d6e34b3353" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_physical_exams" ADD CONSTRAINT "FK_ad5d8f572c07587c0e607b6988f" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_physical_exams" ADD CONSTRAINT "FK_97daf3c50bf32d37ac888d6445e" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_physical_exams" ADD CONSTRAINT "FK_9d4234028fd3599c175a1ce9f4f" FOREIGN KEY ("antenatal_id") REFERENCES "patient_antenatals"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_histories" ADD CONSTRAINT "FK_2b3f4c788682324fd3657a30a6f" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_histories" ADD CONSTRAINT "FK_404102d46b2253bdfae105902bb" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_histories" ADD CONSTRAINT "FK_a273d229bc906ca8608586061c8" FOREIGN KEY ("antenatal_id") REFERENCES "patient_antenatals"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_past_diagnoses" ADD CONSTRAINT "FK_1a39d46a6337771f22b27773e6b" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_past_diagnoses" ADD CONSTRAINT "FK_37fd14bd1303eb4ac4c9229ee68" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "encounters" ADD CONSTRAINT "FK_bb9694e5661b8635d77020d9529" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "encounters" DROP CONSTRAINT "FK_bb9694e5661b8635d77020d9529"`);
        await queryRunner.query(`ALTER TABLE "patient_past_diagnoses" DROP CONSTRAINT "FK_37fd14bd1303eb4ac4c9229ee68"`);
        await queryRunner.query(`ALTER TABLE "patient_past_diagnoses" DROP CONSTRAINT "FK_1a39d46a6337771f22b27773e6b"`);
        await queryRunner.query(`ALTER TABLE "patient_histories" DROP CONSTRAINT "FK_a273d229bc906ca8608586061c8"`);
        await queryRunner.query(`ALTER TABLE "patient_histories" DROP CONSTRAINT "FK_404102d46b2253bdfae105902bb"`);
        await queryRunner.query(`ALTER TABLE "patient_histories" DROP CONSTRAINT "FK_2b3f4c788682324fd3657a30a6f"`);
        await queryRunner.query(`ALTER TABLE "patient_physical_exams" DROP CONSTRAINT "FK_9d4234028fd3599c175a1ce9f4f"`);
        await queryRunner.query(`ALTER TABLE "patient_physical_exams" DROP CONSTRAINT "FK_97daf3c50bf32d37ac888d6445e"`);
        await queryRunner.query(`ALTER TABLE "patient_physical_exams" DROP CONSTRAINT "FK_ad5d8f572c07587c0e607b6988f"`);
        await queryRunner.query(`ALTER TABLE "patient_notes" DROP CONSTRAINT "FK_a929625dc2c0740b3d6e34b3353"`);
        await queryRunner.query(`ALTER TABLE "patient_notes" DROP CONSTRAINT "FK_3a88b654dceb39a4986d1fefdad"`);
        await queryRunner.query(`ALTER TABLE "patient_allergens" DROP CONSTRAINT "FK_61e4c3b1516ba66904e4152b7e6"`);
        await queryRunner.query(`ALTER TABLE "patient_allergens" DROP CONSTRAINT "FK_659928394a82ec93946e391e465"`);
        await queryRunner.query(`ALTER TABLE "patient_allergens" DROP CONSTRAINT "FK_62ccff26bb8e02223dc4ce3bb89"`);
        await queryRunner.query(`ALTER TABLE "patient_consumables" DROP CONSTRAINT "FK_6d48a7236b898c613e88c7c7c14"`);
        await queryRunner.query(`ALTER TABLE "patient_consumables" DROP CONSTRAINT "FK_c91fb05f0f00ab6b05955f986ec"`);
        await queryRunner.query(`ALTER TABLE "patient_consumables" DROP CONSTRAINT "FK_22a7741e736c9b6d6e2546d5b86"`);
        await queryRunner.query(`ALTER TABLE "patient_requests" DROP CONSTRAINT "FK_63ab0933c7240bfb6f262565c55"`);
        await queryRunner.query(`ALTER TABLE "patient_diagnoses" DROP CONSTRAINT "FK_90015378ee939224fbf818ad0d6"`);
        await queryRunner.query(`ALTER TABLE "patient_diagnoses" DROP CONSTRAINT "FK_3fe6405eb70abf1739b1047b720"`);
        await queryRunner.query(`ALTER TABLE "patient_diagnoses" DROP CONSTRAINT "FK_582613321ed8d049a913b70c396"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "deceased"`);
        await queryRunner.query(`ALTER TABLE "encounters" DROP COLUMN "patient_id"`);
        await queryRunner.query(`ALTER TABLE "patient_requests" DROP COLUMN "encounter_id"`);
        await queryRunner.query(`ALTER TABLE "encounters" ADD "instructions" text`);
        await queryRunner.query(`ALTER TABLE "encounters" ADD "note" text`);
        await queryRunner.query(`ALTER TABLE "encounters" ADD "consumable" text`);
        await queryRunner.query(`ALTER TABLE "encounters" ADD "nextAppointment" text`);
        await queryRunner.query(`ALTER TABLE "encounters" ADD "plan" text`);
        await queryRunner.query(`ALTER TABLE "encounters" ADD "diagnosis" text`);
        await queryRunner.query(`ALTER TABLE "encounters" ADD "physicalExaminationSummary" character varying`);
        await queryRunner.query(`ALTER TABLE "encounters" ADD "allergies" text`);
        await queryRunner.query(`ALTER TABLE "encounters" ADD "medicalHistory" text`);
        await queryRunner.query(`ALTER TABLE "encounters" ADD "patientHistory" text`);
        await queryRunner.query(`ALTER TABLE "encounters" ADD "reviewOfSystem" text`);
        await queryRunner.query(`ALTER TABLE "encounters" ADD "complaints" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "encounters" ADD "patientId" integer`);
        await queryRunner.query(`ALTER TABLE "encounters" ADD "labRequest" jsonb`);
        await queryRunner.query(`ALTER TABLE "encounters" ADD "physicalExamination" json`);
        await queryRunner.query(`DROP TABLE "antenatal_packages"`);
        await queryRunner.query(`DROP TABLE "patient_past_diagnoses"`);
        await queryRunner.query(`DROP TABLE "patient_histories"`);
        await queryRunner.query(`DROP TABLE "patient_physical_exams"`);
        await queryRunner.query(`DROP TABLE "patient_notes"`);
        await queryRunner.query(`DROP TABLE "patient_allergens"`);
        await queryRunner.query(`DROP TABLE "patient_consumables"`);
        await queryRunner.query(`DROP TABLE "consumables"`);
        await queryRunner.query(`DROP TABLE "patient_diagnoses"`);
        await queryRunner.query(`ALTER TABLE "encounters" ADD CONSTRAINT "FK_79528cb799cc63dadd8895fd9b7" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
