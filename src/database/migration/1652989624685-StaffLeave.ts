import {MigrationInterface, QueryRunner} from "typeorm";

export class StaffLeave1652989624685 implements MigrationInterface {
    name = 'StaffLeave1652989624685'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leave_applications" DROP CONSTRAINT "FK_eb010d2ad62fa9f54d5edd44dc6"`);
        await queryRunner.query(`ALTER TABLE "leave_applications" DROP COLUMN "leaveType"`);
        await queryRunner.query(`ALTER TABLE "leave_applications" DROP COLUMN "updated_by"`);
        await queryRunner.query(`ALTER TABLE "leave_applications" ADD "leave_type" character varying NOT NULL DEFAULT 'leave'`);
        await queryRunner.query(`ALTER TABLE "leave_applications" ADD "approved_by" character varying`);
        await queryRunner.query(`ALTER TABLE "leave_applications" ADD "approved_at" character varying`);
        await queryRunner.query(`ALTER TABLE "leave_applications" ADD "declined_by" character varying`);
        await queryRunner.query(`ALTER TABLE "leave_applications" ADD "declined_at" character varying`);
        await queryRunner.query(`ALTER TABLE "leave_applications" ADD "decline_reason" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leave_applications" DROP COLUMN "decline_reason"`);
        await queryRunner.query(`ALTER TABLE "leave_applications" DROP COLUMN "declined_at"`);
        await queryRunner.query(`ALTER TABLE "leave_applications" DROP COLUMN "declined_by"`);
        await queryRunner.query(`ALTER TABLE "leave_applications" DROP COLUMN "approved_at"`);
        await queryRunner.query(`ALTER TABLE "leave_applications" DROP COLUMN "approved_by"`);
        await queryRunner.query(`ALTER TABLE "leave_applications" DROP COLUMN "leave_type"`);
        await queryRunner.query(`ALTER TABLE "leave_applications" ADD "updated_by" integer`);
        await queryRunner.query(`ALTER TABLE "leave_applications" ADD "leaveType" character varying NOT NULL DEFAULT 'leave'`);
        await queryRunner.query(`ALTER TABLE "leave_applications" ADD CONSTRAINT "FK_eb010d2ad62fa9f54d5edd44dc6" FOREIGN KEY ("updated_by") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
