import {MigrationInterface, QueryRunner} from "typeorm";

export class PatientCareTeam1627922408209 implements MigrationInterface {
    name = 'PatientCareTeam1627922408209'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "care-teams" ("id" SERIAL NOT NULL, "old_id" character varying, "createdBy" character varying(300) NOT NULL DEFAULT 'it-admin', "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_primary_care_giver" boolean NOT NULL DEFAULT false, "type" character varying NOT NULL, "item_id" character varying, "care_giver_id" integer, "patient_id" integer, CONSTRAINT "PK_75b31a4f17ffcd50e026c6d9e99" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "care-teams" ADD CONSTRAINT "FK_e013da11ee19be61d30de7efc64" FOREIGN KEY ("care_giver_id") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "care-teams" ADD CONSTRAINT "FK_3211f9074bd48dffe38228df5a1" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "care-teams" DROP CONSTRAINT "FK_3211f9074bd48dffe38228df5a1"`);
        await queryRunner.query(`ALTER TABLE "care-teams" DROP CONSTRAINT "FK_e013da11ee19be61d30de7efc64"`);
        await queryRunner.query(`DROP TABLE "care-teams"`);
    }

}
