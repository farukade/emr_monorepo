import {MigrationInterface, QueryRunner} from "typeorm";

export class Attendance1655292536626 implements MigrationInterface {
    name = 'Attendance1655292536626'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "attendance" ("id" SERIAL NOT NULL, "old_id" character varying, "createdBy" character varying(300) NOT NULL DEFAULT 'admin', "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "date" TIMESTAMP NOT NULL, "userDeviceId" integer NOT NULL, "ip" character varying NOT NULL, "staff_id" integer, CONSTRAINT "PK_ee0ffe42c1f1a01e72b725c0cb2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" ALTER COLUMN "can_schedule" SET DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "attendance" ADD CONSTRAINT "FK_99d7d43e6a69506c5f71095a108" FOREIGN KEY ("staff_id") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attendance" DROP CONSTRAINT "FK_99d7d43e6a69506c5f71095a108"`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" ALTER COLUMN "can_schedule" SET DEFAULT false`);
        await queryRunner.query(`DROP TABLE "attendance"`);
    }

}
