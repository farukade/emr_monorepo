import {MigrationInterface, QueryRunner} from "typeorm";

export class HrAttendance1655888233372 implements MigrationInterface {
    name = 'HrAttendance1655888233372'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "attendance-device" ("id" SERIAL NOT NULL, "old_id" character varying, "createdBy" character varying(300) NOT NULL DEFAULT 'admin', "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "ip" character varying NOT NULL, "name" character varying, CONSTRAINT "PK_ba19140f051c7074e5baf101416" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "attendance-department" ("id" SERIAL NOT NULL, "old_id" character varying, "createdBy" character varying(300) NOT NULL DEFAULT 'admin', "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "isClinical" boolean NOT NULL DEFAULT true, "device_id" integer, CONSTRAINT "UQ_b95241e1defe797c1bfea30b452" UNIQUE ("name"), CONSTRAINT "PK_d59b2e7116fb6d1d8e27912e4f9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "attendance-staff" ("id" SERIAL NOT NULL, "old_id" character varying, "createdBy" character varying(300) NOT NULL DEFAULT 'admin', "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "staffNum" character varying NOT NULL, "department_id" integer, "device_id" integer, CONSTRAINT "UQ_273a12350212e43691e3e6b7842" UNIQUE ("staffNum"), CONSTRAINT "PK_fdeb3e0210b39a5a4d092cad2d8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "attendance" ("id" SERIAL NOT NULL, "old_id" character varying, "createdBy" character varying(300) NOT NULL DEFAULT 'admin', "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "date" TIMESTAMP NOT NULL, "userDeviceId" integer NOT NULL, "ip" character varying NOT NULL, "staff_id" integer, "device_id" integer, CONSTRAINT "PK_ee0ffe42c1f1a01e72b725c0cb2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "attendance-department" ADD CONSTRAINT "FK_56a864ca3e231f7071bec8275f5" FOREIGN KEY ("device_id") REFERENCES "attendance-device"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendance-staff" ADD CONSTRAINT "FK_3c595277decbab3cc79a99a739c" FOREIGN KEY ("department_id") REFERENCES "attendance-department"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendance-staff" ADD CONSTRAINT "FK_202fef6906fd923470631f0eba2" FOREIGN KEY ("device_id") REFERENCES "attendance-device"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendance" ADD CONSTRAINT "FK_99d7d43e6a69506c5f71095a108" FOREIGN KEY ("staff_id") REFERENCES "attendance-staff"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendance" ADD CONSTRAINT "FK_f0d27f126d15fb5d222aa986459" FOREIGN KEY ("device_id") REFERENCES "attendance-device"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attendance" DROP CONSTRAINT "FK_f0d27f126d15fb5d222aa986459"`);
        await queryRunner.query(`ALTER TABLE "attendance" DROP CONSTRAINT "FK_99d7d43e6a69506c5f71095a108"`);
        await queryRunner.query(`ALTER TABLE "attendance-staff" DROP CONSTRAINT "FK_202fef6906fd923470631f0eba2"`);
        await queryRunner.query(`ALTER TABLE "attendance-staff" DROP CONSTRAINT "FK_3c595277decbab3cc79a99a739c"`);
        await queryRunner.query(`ALTER TABLE "attendance-department" DROP CONSTRAINT "FK_56a864ca3e231f7071bec8275f5"`);
        await queryRunner.query(`DROP TABLE "attendance"`);
        await queryRunner.query(`DROP TABLE "attendance-staff"`);
        await queryRunner.query(`DROP TABLE "attendance-department"`);
        await queryRunner.query(`DROP TABLE "attendance-device"`);
    }

}
