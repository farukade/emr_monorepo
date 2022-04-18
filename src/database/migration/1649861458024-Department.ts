import {MigrationInterface, QueryRunner} from "typeorm";

export class Department1649861458024 implements MigrationInterface {
    name = 'Department1649861458024'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "departments" ADD "slug" character varying`);
        await queryRunner.query(`ALTER TABLE "doctor_appointments" ALTER COLUMN "is_booked" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor_appointments" ALTER COLUMN "is_booked" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "departments" DROP COLUMN "slug"`);
    }

}
