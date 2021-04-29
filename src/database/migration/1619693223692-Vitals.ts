import {MigrationInterface, QueryRunner} from "typeorm";

export class Vitals1619693223692 implements MigrationInterface {
    name = 'Vitals1619693223692'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "patient_alerts" ("id" SERIAL NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdBy" character varying(300), "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "type" character varying NOT NULL, "message" character varying NOT NULL, "read" boolean NOT NULL DEFAULT false, "read_by" character varying(300), "patient_id" integer, CONSTRAINT "PK_bdbbc0611ae8e29773828c1baa4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "patient_vitals" ADD "is_abnormal" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "patient_alerts" ADD CONSTRAINT "FK_942cd5e328813f4ed6287035759" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_alerts" DROP CONSTRAINT "FK_942cd5e328813f4ed6287035759"`);
        await queryRunner.query(`ALTER TABLE "patient_vitals" DROP COLUMN "is_abnormal"`);
        await queryRunner.query(`DROP TABLE "patient_alerts"`);
    }

}
