import {MigrationInterface, QueryRunner} from "typeorm";

export class Appointment1641354014819 implements MigrationInterface {
    name = 'Appointment1641354014819'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" ADD "is_scheduled" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "is_scheduled"`);
    }

}
