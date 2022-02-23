import {MigrationInterface, QueryRunner} from "typeorm";

export class AdmissionRoom1645642209536 implements MigrationInterface {
    name = 'AdmissionRoom1645642209536'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "admission_rooms" ("id" SERIAL NOT NULL, "old_id" character varying, "createdBy" character varying(300) NOT NULL DEFAULT 'it-admin', "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "assigned_at" character varying, "assigned_by" character varying, "checked_out_at" character varying, "checked_out_by" character varying, "admission_id" integer, "room_id" integer, CONSTRAINT "PK_55bb1a3a63d993b94255c718be7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "admission_rooms" ADD CONSTRAINT "FK_3d8ebd78a16ec3202274cdb3dfc" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admission_rooms" ADD CONSTRAINT "FK_272e8d089c419a1ff58479d2e31" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admission_rooms" DROP CONSTRAINT "FK_272e8d089c419a1ff58479d2e31"`);
        await queryRunner.query(`ALTER TABLE "admission_rooms" DROP CONSTRAINT "FK_3d8ebd78a16ec3202274cdb3dfc"`);
        await queryRunner.query(`DROP TABLE "admission_rooms"`);
    }

}
