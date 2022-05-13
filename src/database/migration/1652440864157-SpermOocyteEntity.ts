import {MigrationInterface, QueryRunner} from "typeorm";

export class SpermOocyteEntity1652440864157 implements MigrationInterface {
    name = 'SpermOocyteEntity1652440864157'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "sperm_oocyte_donor" ("id" SERIAL NOT NULL, "old_id" character varying, "createdBy" character varying(300) NOT NULL DEFAULT 'admin', "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "gender" character varying, "age" integer, "name" character varying, "bloodGroup" character varying, "genotype" character varying, "height" double precision, "weight" integer, "bmi" character varying, "complexion" character varying, "stateOfOrigin" character varying, CONSTRAINT "PK_8f113fb0c705c561809a738588e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "oocyte_emb" ("id" SERIAL NOT NULL, "old_id" character varying, "createdBy" character varying(300) NOT NULL DEFAULT 'admin', "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "date" date, "numOfOocyte" integer, "grade" character varying, "numOfStems" integer, "dewar" integer, "position" integer, "description" character varying, "mediaUsed" character varying, "sperm_oocyte_donor" integer, CONSTRAINT "REL_b81e20b4a736744dd91abd7a5b" UNIQUE ("sperm_oocyte_donor"), CONSTRAINT "PK_9799339793ad3c222e4fa264f73" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sperm_emb" ("id" SERIAL NOT NULL, "old_id" character varying, "createdBy" character varying(300) NOT NULL DEFAULT 'admin', "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "date" date, "timeDelivered" character varying, "timeFrozen" character varying, "cone" character varying, "numOfVials" integer, "dewar" integer, "position" integer, "description" character varying, "mediaUsed" character varying, "sperm_oocyte_donor" integer, CONSTRAINT "REL_eb14067aecbadf7e8ade5ad4bf" UNIQUE ("sperm_oocyte_donor"), CONSTRAINT "PK_728f4d912ed35984f2b3e654f63" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "emb_freezing" ("id" SERIAL NOT NULL, "old_id" character varying, "createdBy" character varying(300) NOT NULL DEFAULT 'admin', "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "sperm_entity" integer, "oocyte_entity" integer, CONSTRAINT "REL_93118c849a2e01dfbc072091ec" UNIQUE ("sperm_entity"), CONSTRAINT "REL_52d54e35f593972b9003e0d4e9" UNIQUE ("oocyte_entity"), CONSTRAINT "PK_21ed6838d485ec4151e3f33cc2e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "oocyte_emb" ADD CONSTRAINT "FK_b81e20b4a736744dd91abd7a5b6" FOREIGN KEY ("sperm_oocyte_donor") REFERENCES "sperm_oocyte_donor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sperm_emb" ADD CONSTRAINT "FK_eb14067aecbadf7e8ade5ad4bfb" FOREIGN KEY ("sperm_oocyte_donor") REFERENCES "sperm_oocyte_donor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "emb_freezing" ADD CONSTRAINT "FK_93118c849a2e01dfbc072091ec8" FOREIGN KEY ("sperm_entity") REFERENCES "sperm_emb"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "emb_freezing" ADD CONSTRAINT "FK_52d54e35f593972b9003e0d4e93" FOREIGN KEY ("oocyte_entity") REFERENCES "oocyte_emb"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "emb_freezing" DROP CONSTRAINT "FK_52d54e35f593972b9003e0d4e93"`);
        await queryRunner.query(`ALTER TABLE "emb_freezing" DROP CONSTRAINT "FK_93118c849a2e01dfbc072091ec8"`);
        await queryRunner.query(`ALTER TABLE "sperm_emb" DROP CONSTRAINT "FK_eb14067aecbadf7e8ade5ad4bfb"`);
        await queryRunner.query(`ALTER TABLE "oocyte_emb" DROP CONSTRAINT "FK_b81e20b4a736744dd91abd7a5b6"`);
        await queryRunner.query(`DROP TABLE "emb_freezing"`);
        await queryRunner.query(`DROP TABLE "sperm_emb"`);
        await queryRunner.query(`DROP TABLE "oocyte_emb"`);
        await queryRunner.query(`DROP TABLE "sperm_oocyte_donor"`);
    }

}
