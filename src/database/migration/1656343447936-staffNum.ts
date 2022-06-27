import {MigrationInterface, QueryRunner} from "typeorm";

export class staffNum1656343447936 implements MigrationInterface {
    name = 'staffNum1656343447936'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attendance-staff" DROP CONSTRAINT "UQ_273a12350212e43691e3e6b7842"`);
        await queryRunner.query(`ALTER TABLE "attendance-staff" DROP COLUMN "staffNum"`);
        await queryRunner.query(`ALTER TABLE "attendance-staff" ADD "staff_num" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "attendance-staff" DROP CONSTRAINT "FK_3c595277decbab3cc79a99a739c"`);
        await queryRunner.query(`ALTER TABLE "attendance-staff" DROP CONSTRAINT "FK_202fef6906fd923470631f0eba2"`);
        await queryRunner.query(`ALTER TABLE "attendance-staff" ALTER COLUMN "createdBy" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "attendance-staff" ALTER COLUMN "createdAt" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "attendance-staff" ALTER COLUMN "updated_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "attendance-staff" ALTER COLUMN "department_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "attendance-staff" ALTER COLUMN "device_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "attendance-staff" ADD CONSTRAINT "FK_3c595277decbab3cc79a99a739c" FOREIGN KEY ("department_id") REFERENCES "attendance-department"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendance-staff" ADD CONSTRAINT "FK_202fef6906fd923470631f0eba2" FOREIGN KEY ("device_id") REFERENCES "attendance-device"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attendance-staff" DROP CONSTRAINT "FK_202fef6906fd923470631f0eba2"`);
        await queryRunner.query(`ALTER TABLE "attendance-staff" DROP CONSTRAINT "FK_3c595277decbab3cc79a99a739c"`);
        await queryRunner.query(`ALTER TABLE "attendance-staff" ALTER COLUMN "device_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "attendance-staff" ALTER COLUMN "department_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "attendance-staff" ALTER COLUMN "updated_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "attendance-staff" ALTER COLUMN "createdAt" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "attendance-staff" ALTER COLUMN "createdBy" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "attendance-staff" ADD CONSTRAINT "FK_202fef6906fd923470631f0eba2" FOREIGN KEY ("device_id") REFERENCES "attendance-device"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendance-staff" ADD CONSTRAINT "FK_3c595277decbab3cc79a99a739c" FOREIGN KEY ("department_id") REFERENCES "attendance-department"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendance-staff" DROP COLUMN "staff_num"`);
        await queryRunner.query(`ALTER TABLE "attendance-staff" ADD "staffNum" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "attendance-staff" ADD CONSTRAINT "UQ_273a12350212e43691e3e6b7842" UNIQUE ("staffNum")`);
    }

}
