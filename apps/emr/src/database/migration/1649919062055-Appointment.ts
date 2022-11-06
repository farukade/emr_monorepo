import {MigrationInterface, QueryRunner} from "typeorm";

export class Appointment1649919062055 implements MigrationInterface {
    name = 'Appointment1649919062055'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" ADD "is_queued" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "is_queued"`);
    }

}
