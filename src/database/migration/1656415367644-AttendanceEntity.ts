import {MigrationInterface, QueryRunner} from "typeorm";

export class AttendanceEntity1656415367644 implements MigrationInterface {
    name = 'AttendanceEntity1656415367644'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attendance" DROP COLUMN "userDeviceId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attendance" ADD "userDeviceId" integer NOT NULL`);
    }

}
