import {MigrationInterface, QueryRunner} from "typeorm";

export class AppointmentTableUpdate1597829843297 implements MigrationInterface {
    name = 'AppointmentTableUpdate1597829843297'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "doctorStatus"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "doctorStatus" smallint NOT NULL DEFAULT 0`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "next_location"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "next_location" character varying`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "next_location"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "next_location" character varying(20)`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "doctorStatus"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "doctorStatus" integer DEFAULT 0`, undefined);
    }

}
