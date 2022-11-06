import {MigrationInterface, QueryRunner} from "typeorm";

export class Department1647961947199 implements MigrationInterface {
    name = 'Department1647961947199'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "departments" ADD "has_appointment" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "departments" DROP COLUMN "has_appointment"`);
    }

}
