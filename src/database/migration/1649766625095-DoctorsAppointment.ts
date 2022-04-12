import {MigrationInterface, QueryRunner} from "typeorm";

export class DoctorsAppointment1649766625095 implements MigrationInterface {
    name = 'DoctorsAppointment1649766625095'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "doctor_appointments" ("id" SERIAL NOT NULL, "old_id" character varying, "createdBy" character varying(300) NOT NULL DEFAULT 'admin', "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "appointment_datetime" character varying NOT NULL, "appointment_time" character varying NOT NULL, "appointment_date" character varying NOT NULL, "is_online" boolean NOT NULL DEFAULT false, "is_booked" boolean DEFAULT false, "department_id" integer, "patient_id" integer, "doctor_id" integer, CONSTRAINT "PK_4d64b09d0758c0d1c9f50f07f6a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "inventory_purchases" ADD "selling_price" real NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "doctor_appointments" ADD CONSTRAINT "FK_84482a99c2f8fc01774609a1ce4" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "doctor_appointments" ADD CONSTRAINT "FK_a76a01180ea053c78693e1dffd1" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "doctor_appointments" ADD CONSTRAINT "FK_0717372e449c9522be992ede9bc" FOREIGN KEY ("doctor_id") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor_appointments" DROP CONSTRAINT "FK_0717372e449c9522be992ede9bc"`);
        await queryRunner.query(`ALTER TABLE "doctor_appointments" DROP CONSTRAINT "FK_a76a01180ea053c78693e1dffd1"`);
        await queryRunner.query(`ALTER TABLE "doctor_appointments" DROP CONSTRAINT "FK_84482a99c2f8fc01774609a1ce4"`);
        await queryRunner.query(`ALTER TABLE "inventory_purchases" DROP COLUMN "selling_price"`);
        await queryRunner.query(`DROP TABLE "doctor_appointments"`);
    }

}
