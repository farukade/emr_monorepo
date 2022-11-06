import {MigrationInterface, QueryRunner} from "typeorm";

export class Appointment1638373374215 implements MigrationInterface {
    name = 'Appointment1638373374215'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" ADD "consultation_type" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "consultation_type"`);
    }

}
