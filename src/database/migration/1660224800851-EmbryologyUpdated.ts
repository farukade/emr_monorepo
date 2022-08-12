import {MigrationInterface, QueryRunner} from "typeorm";

export class EmbryologyUpdated1660224800851 implements MigrationInterface {
    name = 'EmbryologyUpdated1660224800851'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ivf_biopsy" ("id" SERIAL NOT NULL, "old_id" character varying, "createdBy" character varying(300) NOT NULL DEFAULT 'admin', "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "type" character varying, "one" character varying, "two" character varying, "three" character varying, "four" character varying, "five" character varying, "six" character varying, "seven" character varying, "eight" character varying, "nine" character varying, "ten" character varying, "eleven" character varying, "twelve" character varying, "assessment_id" integer, CONSTRAINT "PK_df6982312661e3d2bd8ab232e5b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ivf_day_record" ("id" SERIAL NOT NULL, "old_id" character varying, "createdBy" character varying(300) NOT NULL DEFAULT 'admin', "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "type" character varying, "one_pn" character varying, "two_pn" character varying, "three_pn" character varying, "mil" character varying, "ml" character varying, "gv" character varying, "others" character varying, "comment" character varying, "witness" character varying, "embryologist" character varying, "icsi_id" integer, CONSTRAINT "PK_b1c9b9a0c17bc0de799041c4dd2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ivf_cell_info" ("id" SERIAL NOT NULL, "old_id" character varying, "createdBy" character varying(300) NOT NULL DEFAULT 'admin', "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "type" character varying NOT NULL, "volume" real, "cells" character varying, "density" character varying, "motility" character varying, "prog" character varying, "abnor" real, "agglutination" real, "sperm_prep_id" integer, CONSTRAINT "PK_b431a694daaef5f7eb73c8a1b04" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "ivf_biopsy" ADD CONSTRAINT "FK_63d921d5a5b19d677f3de3b5aa4" FOREIGN KEY ("assessment_id") REFERENCES "embryo_assessment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ivf_day_record" ADD CONSTRAINT "FK_e7b9a30b8091802b44c2cba94f9" FOREIGN KEY ("icsi_id") REFERENCES "ivf_icsi"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ivf_cell_info" ADD CONSTRAINT "FK_acf3b4115dec98b468d6a1e6938" FOREIGN KEY ("sperm_prep_id") REFERENCES "ivf_sperm_preparation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ivf_cell_info" DROP CONSTRAINT "FK_acf3b4115dec98b468d6a1e6938"`);
        await queryRunner.query(`ALTER TABLE "ivf_day_record" DROP CONSTRAINT "FK_e7b9a30b8091802b44c2cba94f9"`);
        await queryRunner.query(`ALTER TABLE "ivf_biopsy" DROP CONSTRAINT "FK_63d921d5a5b19d677f3de3b5aa4"`);
        await queryRunner.query(`DROP TABLE "ivf_cell_info"`);
        await queryRunner.query(`DROP TABLE "ivf_day_record"`);
        await queryRunner.query(`DROP TABLE "ivf_biopsy"`);
    }

}
