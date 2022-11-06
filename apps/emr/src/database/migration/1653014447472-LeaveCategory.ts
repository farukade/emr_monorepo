import {MigrationInterface, QueryRunner} from "typeorm";

export class LeaveCategory1653014447472 implements MigrationInterface {
    name = 'LeaveCategory1653014447472'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leave_categories" ALTER COLUMN "duration" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leave_categories" ALTER COLUMN "duration" SET NOT NULL`);
    }

}
