import {MigrationInterface, QueryRunner} from "typeorm";

export class LabourManagementTables1588343736205 implements MigrationInterface {
    name = 'LabourManagementTables1588343736205'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "encounters" DROP CONSTRAINT "FK_79528cb799cc63dadd8895fd9b7"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP CONSTRAINT "FK_61d7611a612fc2c4c86af509e35"`, undefined);
        await queryRunner.query(`CREATE TABLE "labour_enrollemnts" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "husbandName" character varying NOT NULL, "husbandPhoneNo" character varying NOT NULL, "bloodGroup" character varying, "parity" character varying, "alive" character varying, "miscarriage" character varying, "presentPregnancy" character varying, "lmp" character varying, "patient_id" uuid, CONSTRAINT "PK_5a7d0db02dfe82d7bdc951646fe" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "labour_delivery_records" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "deliveryType" character varying NOT NULL, "isMotherAlive" boolean NOT NULL, "isBabyAlive" boolean NOT NULL, "administeredOxytocin" boolean NOT NULL, "placentaComplete" boolean NOT NULL, "bleeading" boolean NOT NULL, "timeOfBirth" character varying NOT NULL, "dateOfBirth" character varying NOT NULL, "babyCried" boolean NOT NULL, "sexOfBaby" character varying NOT NULL, "apgarScore" character varying NOT NULL, "weight" character varying NOT NULL, "administeredVitaminK" boolean NOT NULL, "negativeRH" boolean NOT NULL, "drugsAdministered" character varying, "transferredTo" character varying NOT NULL, "comment" character varying, "pediatricianId" uuid, "enrollementId" uuid, CONSTRAINT "PK_11be5af111a54c975dd1981577f" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "labour_measurements" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "isFalseLabour" boolean, "presentation" character varying, "positionOfFestus" character varying, "fetalLies" character varying, "descent" character varying, "cervicalLength" character varying, "cervicalEffacement" character varying, "cervicalPosition" character varying, "membrances" character varying, "moulding" character varying, "caput" character varying, "hasPassedUrine" boolean, "administeredCyatacin" boolean, "administeredDrugs" boolean, "timeOfMeasurement" character varying NOT NULL, "dateOfMeasurement" character varying NOT NULL, "labTests" text, "measurements" text, "examinerId" uuid, "enrollementId" uuid, CONSTRAINT "PK_0be4f6526f76ac2d8057e6aeea3" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "labour_risk_assessments" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "height" character varying NOT NULL, "weight" character varying NOT NULL, "previousPregnancyOutcome" character varying NOT NULL, "previousPregnancyExperience" text NOT NULL, "note" character varying NOT NULL, "enrollementId" uuid, CONSTRAINT "PK_3225d806e48f7d0991100fb624c" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "labour_vitals" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "fetalHeartRate" character varying NOT NULL, "cervicalDialation" character varying NOT NULL, "fetalHeadDescent" character varying NOT NULL, "isMotherAlive" boolean DEFAULT true, "numberOfContractions" character varying NOT NULL, "durationOfContractions" character varying NOT NULL, "bloodPressure" character varying NOT NULL, "currentPulse" character varying NOT NULL, "currentTemperature" character varying NOT NULL, "bloodSugarLevel" character varying NOT NULL, "respirationRate" character varying NOT NULL, "nextAction" character varying NOT NULL, "enrollementId" uuid, CONSTRAINT "PK_665a95a0dac87beaa0ee0c4b020" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "encounters" DROP COLUMN "procedure"`, undefined);
        await queryRunner.query(`ALTER TABLE "encounters" DROP COLUMN "patientId"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "typeOfVaccine"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "dateOfAdministration"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "vaccineBatchNo"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "nextVisitDate"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "administeredBy"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "prescription"`, undefined);
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
        await queryRunner.query(`ALTER TABLE "encounters" ADD CONSTRAINT "FK_79528cb799cc63dadd8895fd9b7" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD CONSTRAINT "FK_61d7611a612fc2c4c86af509e35" FOREIGN KEY ("administeredBy") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "labour_enrollemnts" ADD CONSTRAINT "FK_26136e00620d83106f57c87149c" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "labour_delivery_records" ADD CONSTRAINT "FK_5b8d3603d63505747194cd3518d" FOREIGN KEY ("pediatricianId") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "labour_delivery_records" ADD CONSTRAINT "FK_d909f076e17cec09d6cbb7a9d9d" FOREIGN KEY ("enrollementId") REFERENCES "labour_enrollemnts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "labour_measurements" ADD CONSTRAINT "FK_bbdd4a7a35a0e0082b531b4fc38" FOREIGN KEY ("examinerId") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "labour_measurements" ADD CONSTRAINT "FK_fde2037d9915be7816cfce60295" FOREIGN KEY ("enrollementId") REFERENCES "labour_enrollemnts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "labour_risk_assessments" ADD CONSTRAINT "FK_9d7546e360442860d77ba9c4f4d" FOREIGN KEY ("enrollementId") REFERENCES "labour_enrollemnts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "labour_vitals" ADD CONSTRAINT "FK_2db4eb4d026523c75959c0c8f00" FOREIGN KEY ("enrollementId") REFERENCES "labour_enrollemnts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "labour_vitals" DROP CONSTRAINT "FK_2db4eb4d026523c75959c0c8f00"`, undefined);
        await queryRunner.query(`ALTER TABLE "labour_risk_assessments" DROP CONSTRAINT "FK_9d7546e360442860d77ba9c4f4d"`, undefined);
        await queryRunner.query(`ALTER TABLE "labour_measurements" DROP CONSTRAINT "FK_fde2037d9915be7816cfce60295"`, undefined);
        await queryRunner.query(`ALTER TABLE "labour_measurements" DROP CONSTRAINT "FK_bbdd4a7a35a0e0082b531b4fc38"`, undefined);
        await queryRunner.query(`ALTER TABLE "labour_delivery_records" DROP CONSTRAINT "FK_d909f076e17cec09d6cbb7a9d9d"`, undefined);
        await queryRunner.query(`ALTER TABLE "labour_delivery_records" DROP CONSTRAINT "FK_5b8d3603d63505747194cd3518d"`, undefined);
        await queryRunner.query(`ALTER TABLE "labour_enrollemnts" DROP CONSTRAINT "FK_26136e00620d83106f57c87149c"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP CONSTRAINT "FK_61d7611a612fc2c4c86af509e35"`, undefined);
        await queryRunner.query(`ALTER TABLE "encounters" DROP CONSTRAINT "FK_79528cb799cc63dadd8895fd9b7"`, undefined);
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
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "prescription" jsonb`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "administeredBy" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "nextVisitDate" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "vaccineBatchNo" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "dateOfAdministration" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "typeOfVaccine" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "encounters" ADD "patientId" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "encounters" ADD "procedure" text`, undefined);
        await queryRunner.query(`DROP TABLE "labour_vitals"`, undefined);
        await queryRunner.query(`DROP TABLE "labour_risk_assessments"`, undefined);
        await queryRunner.query(`DROP TABLE "labour_measurements"`, undefined);
        await queryRunner.query(`DROP TABLE "labour_delivery_records"`, undefined);
        await queryRunner.query(`DROP TABLE "labour_enrollemnts"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD CONSTRAINT "FK_61d7611a612fc2c4c86af509e35" FOREIGN KEY ("administeredBy") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "encounters" ADD CONSTRAINT "FK_79528cb799cc63dadd8895fd9b7" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

}
