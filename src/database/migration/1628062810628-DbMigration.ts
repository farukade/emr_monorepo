import {MigrationInterface, QueryRunner} from "typeorm";

export class DbMigration1628062810628 implements MigrationInterface {
    name = 'DbMigration1628062810628'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "admission_rounds" ("id" SERIAL NOT NULL, "old_id" character varying, "createdBy" character varying(300) NOT NULL DEFAULT 'it-admin', "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "patient_id" integer, "admission_id" integer, CONSTRAINT "PK_403adabdd9fdd20b90122492d6b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "patient_notes" ADD "admission_id" integer`);
        await queryRunner.query(`ALTER TABLE "users" ADD "mac_address" character varying`);
        await queryRunner.query(`ALTER TABLE "patient_notes" ADD CONSTRAINT "FK_53e78ac13db7a1526bc76d0c29b" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admission_rounds" ADD CONSTRAINT "FK_04ac2ff194eca6eb7f0758b0a8f" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admission_rounds" ADD CONSTRAINT "FK_a72260c9ce15a3df282cc966364" FOREIGN KEY ("admission_id") REFERENCES "admission_rounds"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admission_rounds" DROP CONSTRAINT "FK_a72260c9ce15a3df282cc966364"`);
        await queryRunner.query(`ALTER TABLE "admission_rounds" DROP CONSTRAINT "FK_04ac2ff194eca6eb7f0758b0a8f"`);
        await queryRunner.query(`ALTER TABLE "patient_notes" DROP CONSTRAINT "FK_53e78ac13db7a1526bc76d0c29b"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "mac_address"`);
        await queryRunner.query(`ALTER TABLE "patient_notes" DROP COLUMN "admission_id"`);
        await queryRunner.query(`DROP TABLE "admission_rounds"`);
    }

}
