import {MigrationInterface, QueryRunner} from "typeorm";

export class IvfEmbryologyEntity1652390315201 implements MigrationInterface {
    name = 'IvfEmbryologyEntity1652390315201'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "embryo_assessment" ("id" SERIAL NOT NULL, "date" date, "changeOverDoneBy" character varying, "biopsyDoneBy" character varying, "witness" character varying, "numOfClavingEmbryos" integer, "day2Comment" character varying, "day3Comment" character varying, CONSTRAINT "PK_2f60fd15a4a5fa4f0333c9aada3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ivf_embryo_transfer_record" ("id" SERIAL NOT NULL, "stage" character varying, "grade" character varying, "comments" character varying, "icsi" character varying, "ivf" character varying, CONSTRAINT "PK_5f681788c8e3900e2aef55ce8f3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ivf_embryo_transfer" ("id" SERIAL NOT NULL, "nameOfEmbryoTransfered" character varying, "numOfEmbryoTransfered" integer, "dateOfEmbryoTransfered" date, "dr" character varying, "embryologist" character varying, "date" date, "numOfEmbryoVit" integer, "numOfStraws" integer, "ivf_embryo_trans_record_id" integer, CONSTRAINT "PK_91180ff322b4c9c3e0a4ea688fd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ivf_icsi" ("id" SERIAL NOT NULL, "time" character varying, "mii" character varying, "migv" character varying, "frag" character varying, "abn" character varying, "icsiMethod" character varying, "opDate" date, "docyteInjected" integer, "docyteInseminated" integer, "totalDocyte" integer, "comment" character varying, "witness" character varying, "staff_id" integer, CONSTRAINT "PK_1e5ada16899b9c6fe4d640ad810" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ivf_sperm_preparation" ("id" SERIAL NOT NULL, "type" character varying, "donorCode" character varying, "viscousity" character varying, "withdrawalMethod" character varying, "timeOfProduction" character varying, "timeReceived" character varying, "timeAnalyzed" character varying, "witness" character varying, "staff_id" integer, CONSTRAINT "PK_2d5d2563ab7da8fea5ff2b0369f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ivf_treatment" ("id" SERIAL NOT NULL, "treatmentChartType" character varying, "isHIVPositive" boolean, "isHBSagPositive" boolean, "isHcvPositive" boolean, "fsh" character varying, "lh" character varying, "prl" character varying, "tsh" character varying, "amh" character varying, "tes" character varying, "numOfEggsReceived" integer, "instructionsForLab" integer, "method" character varying, "time" character varying, "leftOvary" character varying, "rightOvary" character varying, "ocrDr" character varying, "embr" character varying, "numOfDocytes" integer, "total" integer, CONSTRAINT "PK_9530b70e13bdb51ad484c03b4ac" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ivf_embryology" ("id" SERIAL NOT NULL, "old_id" character varying, "createdBy" character varying(300) NOT NULL DEFAULT 'admin', "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "isSubmitted" boolean DEFAULT false, "patient_id" integer, "ivf_embryo_assessment_id" integer, "ivf_embryo_transfer_id" integer, "ivf_icsi_id" integer, "ivf_sperm_preparation_id" integer, "ivf_treatment_id" integer, CONSTRAINT "REL_bbcdaf5be2a291f661dc699be9" UNIQUE ("ivf_embryo_assessment_id"), CONSTRAINT "REL_0d6f363940c1cae4e42544f315" UNIQUE ("ivf_embryo_transfer_id"), CONSTRAINT "REL_09116ea1c7a9d7f400d2c8f455" UNIQUE ("ivf_icsi_id"), CONSTRAINT "REL_4c428778b4cd695a5715bebe2c" UNIQUE ("ivf_sperm_preparation_id"), CONSTRAINT "REL_4b484c073fd913960ce2f1a8c9" UNIQUE ("ivf_treatment_id"), CONSTRAINT "PK_59658a1d4d8028bdaf03b1cfc45" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "ivf_embryo_transfer" ADD CONSTRAINT "FK_00404eb1e33a903eecaa92652f8" FOREIGN KEY ("ivf_embryo_trans_record_id") REFERENCES "ivf_embryo_transfer_record"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ivf_icsi" ADD CONSTRAINT "FK_aaeab5e4ebefea8a61a57c901e1" FOREIGN KEY ("staff_id") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ivf_sperm_preparation" ADD CONSTRAINT "FK_b85855c2bc5fc93335be0d86935" FOREIGN KEY ("staff_id") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ivf_embryology" ADD CONSTRAINT "FK_b75b4a294e5fbfb3beb120e27ea" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ivf_embryology" ADD CONSTRAINT "FK_bbcdaf5be2a291f661dc699be92" FOREIGN KEY ("ivf_embryo_assessment_id") REFERENCES "embryo_assessment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ivf_embryology" ADD CONSTRAINT "FK_0d6f363940c1cae4e42544f3154" FOREIGN KEY ("ivf_embryo_transfer_id") REFERENCES "ivf_embryo_transfer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ivf_embryology" ADD CONSTRAINT "FK_09116ea1c7a9d7f400d2c8f4551" FOREIGN KEY ("ivf_icsi_id") REFERENCES "ivf_icsi"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ivf_embryology" ADD CONSTRAINT "FK_4c428778b4cd695a5715bebe2c7" FOREIGN KEY ("ivf_sperm_preparation_id") REFERENCES "ivf_sperm_preparation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ivf_embryology" ADD CONSTRAINT "FK_4b484c073fd913960ce2f1a8c99" FOREIGN KEY ("ivf_treatment_id") REFERENCES "ivf_treatment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ivf_embryology" DROP CONSTRAINT "FK_4b484c073fd913960ce2f1a8c99"`);
        await queryRunner.query(`ALTER TABLE "ivf_embryology" DROP CONSTRAINT "FK_4c428778b4cd695a5715bebe2c7"`);
        await queryRunner.query(`ALTER TABLE "ivf_embryology" DROP CONSTRAINT "FK_09116ea1c7a9d7f400d2c8f4551"`);
        await queryRunner.query(`ALTER TABLE "ivf_embryology" DROP CONSTRAINT "FK_0d6f363940c1cae4e42544f3154"`);
        await queryRunner.query(`ALTER TABLE "ivf_embryology" DROP CONSTRAINT "FK_bbcdaf5be2a291f661dc699be92"`);
        await queryRunner.query(`ALTER TABLE "ivf_embryology" DROP CONSTRAINT "FK_b75b4a294e5fbfb3beb120e27ea"`);
        await queryRunner.query(`ALTER TABLE "ivf_sperm_preparation" DROP CONSTRAINT "FK_b85855c2bc5fc93335be0d86935"`);
        await queryRunner.query(`ALTER TABLE "ivf_icsi" DROP CONSTRAINT "FK_aaeab5e4ebefea8a61a57c901e1"`);
        await queryRunner.query(`ALTER TABLE "ivf_embryo_transfer" DROP CONSTRAINT "FK_00404eb1e33a903eecaa92652f8"`);
        await queryRunner.query(`DROP TABLE "ivf_embryology"`);
        await queryRunner.query(`DROP TABLE "ivf_treatment"`);
        await queryRunner.query(`DROP TABLE "ivf_sperm_preparation"`);
        await queryRunner.query(`DROP TABLE "ivf_icsi"`);
        await queryRunner.query(`DROP TABLE "ivf_embryo_transfer"`);
        await queryRunner.query(`DROP TABLE "ivf_embryo_transfer_record"`);
        await queryRunner.query(`DROP TABLE "embryo_assessment"`);
    }

}
