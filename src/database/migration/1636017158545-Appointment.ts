import {MigrationInterface, QueryRunner} from "typeorm";

export class Appointment1636017158545 implements MigrationInterface {
    name = 'Appointment1636017158545'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" ADD "is_covered" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "is_covered"`);
    }

}
