import {MigrationInterface, QueryRunner} from "typeorm";

export class UtitlityTables1582191243933 implements MigrationInterface {
    name = 'UtitlityTables1582191243933'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "banks" ("id" integer NOT NULL, "name" character varying(300) NOT NULL, CONSTRAINT "PK_3975b5f684ec241e3901db62d77" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "states" ("id" integer NOT NULL, "name" character varying(300) NOT NULL, "country_id" integer, CONSTRAINT "PK_09ab30ca0975c02656483265f4f" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "countries" ("id" integer NOT NULL, "name" character varying(300) NOT NULL, "country_code" character varying(20) NOT NULL, "country_code_long" character varying(50) NOT NULL, "dial_code" character varying(20), "currency_name" character varying(50), "currency_symbol" character varying(50), "currency_code" character varying(50), "countr_flag" character varying(50), CONSTRAINT "PK_b2d7006793e8697ab3ae2deff18" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "patient_next_of_kins" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "surname" character varying NOT NULL, "other_names" character varying NOT NULL, "date_of_birth" character varying, "occupation" character varying, "address" character varying, "email" character varying, "phoneNumber" character varying NOT NULL, "gender" character varying, "maritalStatus" character varying, "ethnicity" character varying, CONSTRAINT "PK_3fd921ddae6561a998a1a10b2cc" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "patients" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "surname" character varying NOT NULL, "other_names" character varying NOT NULL, "date_of_birth" character varying NOT NULL, "occupation" character varying, "address" character varying NOT NULL, "email" character varying, "phoneNumber" character varying NOT NULL, "gender" character varying NOT NULL, "maritalStatus" character varying, "insurranceStatus" character varying NOT NULL, "ethnicity" character varying, "referredBy" character varying, "nextOfKinId" uuid, CONSTRAINT "REL_38c53b399a1ca76585c5df15c6" UNIQUE ("nextOfKinId"), CONSTRAINT "PK_a7f0b9fcbb3469d5ec0b0aceaa7" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "appointments" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "clinical_unit_id" character varying, "appointment_type" character varying NOT NULL, "whom_to_see" character varying NOT NULL, "consulting_room" character varying, "duration" character varying, "refferedBy" character varying NOT NULL, "referralCompany" character varying NOT NULL, "patient_id" uuid, "department" uuid, CONSTRAINT "PK_4a437a9a27e948726b8bb3e36ad" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "hmo_rates" ADD "service_id" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "hmo_rates" ALTER COLUMN "rate" DROP NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "hmo_rates" ALTER COLUMN "percentage" DROP NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "states" ADD CONSTRAINT "FK_f3bbd0bc19bb6d8a887add08461" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "patients" ADD CONSTRAINT "FK_38c53b399a1ca76585c5df15c6b" FOREIGN KEY ("nextOfKinId") REFERENCES "patient_next_of_kins"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_3330f054416745deaa2cc130700" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_85318fbb8f828936521f1de5f65" FOREIGN KEY ("department") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "hmo_rates" ADD CONSTRAINT "FK_3d73e6647a79c1a785f1dc553b5" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "hmo_rates" DROP CONSTRAINT "FK_3d73e6647a79c1a785f1dc553b5"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_85318fbb8f828936521f1de5f65"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_3330f054416745deaa2cc130700"`, undefined);
        await queryRunner.query(`ALTER TABLE "patients" DROP CONSTRAINT "FK_38c53b399a1ca76585c5df15c6b"`, undefined);
        await queryRunner.query(`ALTER TABLE "states" DROP CONSTRAINT "FK_f3bbd0bc19bb6d8a887add08461"`, undefined);
        await queryRunner.query(`ALTER TABLE "hmo_rates" ALTER COLUMN "percentage" SET NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "hmo_rates" ALTER COLUMN "rate" SET NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "hmo_rates" DROP COLUMN "service_id"`, undefined);
        await queryRunner.query(`DROP TABLE "appointments"`, undefined);
        await queryRunner.query(`DROP TABLE "patients"`, undefined);
        await queryRunner.query(`DROP TABLE "patient_next_of_kins"`, undefined);
        await queryRunner.query(`DROP TABLE "countries"`, undefined);
        await queryRunner.query(`DROP TABLE "states"`, undefined);
        await queryRunner.query(`DROP TABLE "banks"`, undefined);
    }

}
