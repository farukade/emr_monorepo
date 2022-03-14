import {MigrationInterface, QueryRunner} from "typeorm";

export class ExcuseDuty1647274880957 implements MigrationInterface {
    name = 'ExcuseDuty1647274880957'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "patient_excuse_duties" ("id" SERIAL NOT NULL, "old_id" character varying, "createdBy" character varying(300) NOT NULL DEFAULT 'it-admin', "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "comment" character varying, "start_date" character varying, "end_date" character varying, "patient_id" integer, CONSTRAINT "PK_481c4da91f4c1e7d3cbf2e01714" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "patient_notes" ADD "excuse_duty_id" integer`);
        await queryRunner.query(`ALTER TABLE "patient_excuse_duties" ADD CONSTRAINT "FK_f9363ec02b17bf64f9c9e3fb87e" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_notes" ADD CONSTRAINT "FK_70ccac8f72973d16f89cfd48e2e" FOREIGN KEY ("excuse_duty_id") REFERENCES "patient_excuse_duties"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_notes" DROP CONSTRAINT "FK_70ccac8f72973d16f89cfd48e2e"`);
        await queryRunner.query(`ALTER TABLE "patient_excuse_duties" DROP CONSTRAINT "FK_f9363ec02b17bf64f9c9e3fb87e"`);
        await queryRunner.query(`ALTER TABLE "patient_notes" DROP COLUMN "excuse_duty_id"`);
        await queryRunner.query(`DROP TABLE "patient_excuse_duties"`);
    }

}
