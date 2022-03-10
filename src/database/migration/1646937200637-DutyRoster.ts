import {MigrationInterface, QueryRunner} from "typeorm";

export class DutyRoster1646937200637 implements MigrationInterface {
    name = 'DutyRoster1646937200637'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "duty_rosters" ("id" SERIAL NOT NULL, "old_id" character varying, "createdBy" character varying(300) NOT NULL DEFAULT 'it-admin', "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "period" character varying(20) NOT NULL, "schedule" jsonb NOT NULL, "department_id" integer, "staff_id" integer, CONSTRAINT "PK_bc178812ae71775bee94eff6c2c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "duty_rosters" ADD CONSTRAINT "FK_b9806c951d643796aff79cf6579" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "duty_rosters" ADD CONSTRAINT "FK_c242fe9583cbcb98578f6b5990d" FOREIGN KEY ("staff_id") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "duty_rosters" DROP CONSTRAINT "FK_c242fe9583cbcb98578f6b5990d"`);
        await queryRunner.query(`ALTER TABLE "duty_rosters" DROP CONSTRAINT "FK_b9806c951d643796aff79cf6579"`);
        await queryRunner.query(`DROP TABLE "duty_rosters"`);
    }

}
