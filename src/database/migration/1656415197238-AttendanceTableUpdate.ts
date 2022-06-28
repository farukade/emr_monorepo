import {MigrationInterface, QueryRunner} from "typeorm";

export class AttendanceTableUpdate1656415197238 implements MigrationInterface {
    name = 'AttendanceTableUpdate1656415197238'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attendance" DROP CONSTRAINT "FK_99d7d43e6a69506c5f71095a108"`);
        await queryRunner.query(`ALTER TABLE "attendance" ADD CONSTRAINT "FK_99d7d43e6a69506c5f71095a108" FOREIGN KEY ("staff_id") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attendance" DROP CONSTRAINT "FK_99d7d43e6a69506c5f71095a108"`);
        await queryRunner.query(`ALTER TABLE "attendance" ADD CONSTRAINT "FK_99d7d43e6a69506c5f71095a108" FOREIGN KEY ("staff_id") REFERENCES "attendance-staff"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
