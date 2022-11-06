import {MigrationInterface, QueryRunner} from "typeorm";

export class LabourManagement1642423542070 implements MigrationInterface {
    name = 'LabourManagement1642423542070'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "labour_enrollments" DROP COLUMN "husbandName"`);
        await queryRunner.query(`ALTER TABLE "labour_enrollments" DROP COLUMN "husbandPhoneNo"`);
        await queryRunner.query(`ALTER TABLE "labour_enrollments" DROP COLUMN "bloodGroup"`);
        await queryRunner.query(`ALTER TABLE "labour_enrollments" DROP COLUMN "parity"`);
        await queryRunner.query(`ALTER TABLE "labour_enrollments" DROP COLUMN "presentPregnancy"`);
        await queryRunner.query(`ALTER TABLE "labour_enrollments" ADD "serial_code" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "labour_enrollments" ADD "father" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "labour_enrollments" ADD "present_pregnancies" character varying`);
        await queryRunner.query(`ALTER TABLE "labour_enrollments" ADD "status" smallint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "labour_enrollments" ADD "antenatal_id" integer`);
        await queryRunner.query(`ALTER TABLE "labour_enrollments" ADD CONSTRAINT "FK_efc752dfc99a0cb19feeb2543a7" FOREIGN KEY ("antenatal_id") REFERENCES "antenatal_enrollments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "labour_enrollments" DROP CONSTRAINT "FK_efc752dfc99a0cb19feeb2543a7"`);
        await queryRunner.query(`ALTER TABLE "labour_enrollments" DROP COLUMN "antenatal_id"`);
        await queryRunner.query(`ALTER TABLE "labour_enrollments" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "labour_enrollments" DROP COLUMN "present_pregnancies"`);
        await queryRunner.query(`ALTER TABLE "labour_enrollments" DROP COLUMN "father"`);
        await queryRunner.query(`ALTER TABLE "labour_enrollments" DROP COLUMN "serial_code"`);
        await queryRunner.query(`ALTER TABLE "labour_enrollments" ADD "presentPregnancy" character varying`);
        await queryRunner.query(`ALTER TABLE "labour_enrollments" ADD "parity" character varying`);
        await queryRunner.query(`ALTER TABLE "labour_enrollments" ADD "bloodGroup" character varying`);
        await queryRunner.query(`ALTER TABLE "labour_enrollments" ADD "husbandPhoneNo" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "labour_enrollments" ADD "husbandName" character varying NOT NULL`);
    }

}
