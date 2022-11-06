import {MigrationInterface, QueryRunner} from "typeorm";

export class Appointment1649858030912 implements MigrationInterface {
    name = 'Appointment1649858030912'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor_appointments" ADD "appointment_duration" jsonb NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor_appointments" DROP COLUMN "appointment_duration"`);
    }

}
