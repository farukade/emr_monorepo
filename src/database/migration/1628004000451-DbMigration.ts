import {MigrationInterface, QueryRunner} from "typeorm";

export class DbMigration1628004000451 implements MigrationInterface {
    name = 'DbMigration1628004000451'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "patient_care_teams" ("id" SERIAL NOT NULL, "old_id" character varying, "createdBy" character varying(300) NOT NULL DEFAULT 'it-admin', "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_primary_care_giver" boolean NOT NULL DEFAULT false, "type" character varying NOT NULL, "item_id" character varying, "care_giver_id" integer, "patient_id" integer, CONSTRAINT "PK_e55916ce1a24a66f7ec4215913d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "patient_care_teams" ADD CONSTRAINT "FK_7aea96f481f4ca1990aff11e904" FOREIGN KEY ("care_giver_id") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_care_teams" ADD CONSTRAINT "FK_f6679a298b59bf03fc63d094d9d" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_care_teams" DROP CONSTRAINT "FK_f6679a298b59bf03fc63d094d9d"`);
        await queryRunner.query(`ALTER TABLE "patient_care_teams" DROP CONSTRAINT "FK_7aea96f481f4ca1990aff11e904"`);
        await queryRunner.query(`DROP TABLE "patient_care_teams"`);
    }

}
