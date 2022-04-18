import {MigrationInterface, QueryRunner} from "typeorm";

export class DoctorsAppointment1650234978539 implements MigrationInterface {
    name = 'DoctorsAppointment1650234978539'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor_appointments" ADD "appointment_id" integer`);
        await queryRunner.query(`ALTER TABLE "doctor_appointments" ADD CONSTRAINT "UQ_bd8b8be64425ce00841e4871ae2" UNIQUE ("appointment_id")`);
        await queryRunner.query(`ALTER TABLE "doctor_appointments" ADD CONSTRAINT "FK_bd8b8be64425ce00841e4871ae2" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor_appointments" DROP CONSTRAINT "FK_bd8b8be64425ce00841e4871ae2"`);
        await queryRunner.query(`ALTER TABLE "doctor_appointments" DROP CONSTRAINT "UQ_bd8b8be64425ce00841e4871ae2"`);
        await queryRunner.query(`ALTER TABLE "doctor_appointments" DROP COLUMN "appointment_id"`);
    }

}
