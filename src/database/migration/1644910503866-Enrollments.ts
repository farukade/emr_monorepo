import {MigrationInterface, QueryRunner} from "typeorm";

export class Enrollments1644910503866 implements MigrationInterface {
    name = 'Enrollments1644910503866'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ADD "date_closed" character varying`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ADD "closed_by" integer`);
        await queryRunner.query(`ALTER TABLE "labour_enrollments" ADD "date_closed" character varying`);
        await queryRunner.query(`ALTER TABLE "labour_enrollments" ADD "closed_by" integer`);
        await queryRunner.query(`ALTER TABLE "ivf_enrollments" ADD "serial_code" character varying`);
        await queryRunner.query(`ALTER TABLE "ivf_enrollments" ADD "date_closed" character varying`);
        await queryRunner.query(`ALTER TABLE "ivf_enrollments" ADD "closed_by" integer`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ADD CONSTRAINT "FK_306e9d705eb5a183278827d4c6d" FOREIGN KEY ("closed_by") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "labour_enrollments" ADD CONSTRAINT "FK_dbe314210415ddff1d0545ace5f" FOREIGN KEY ("closed_by") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ivf_enrollments" ADD CONSTRAINT "FK_cdebf4b9ad4ab95c30685b4e84a" FOREIGN KEY ("closed_by") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ivf_enrollments" DROP CONSTRAINT "FK_cdebf4b9ad4ab95c30685b4e84a"`);
        await queryRunner.query(`ALTER TABLE "labour_enrollments" DROP CONSTRAINT "FK_dbe314210415ddff1d0545ace5f"`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" DROP CONSTRAINT "FK_306e9d705eb5a183278827d4c6d"`);
        await queryRunner.query(`ALTER TABLE "ivf_enrollments" DROP COLUMN "closed_by"`);
        await queryRunner.query(`ALTER TABLE "ivf_enrollments" DROP COLUMN "date_closed"`);
        await queryRunner.query(`ALTER TABLE "ivf_enrollments" DROP COLUMN "serial_code"`);
        await queryRunner.query(`ALTER TABLE "labour_enrollments" DROP COLUMN "closed_by"`);
        await queryRunner.query(`ALTER TABLE "labour_enrollments" DROP COLUMN "date_closed"`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" DROP COLUMN "closed_by"`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" DROP COLUMN "date_closed"`);
    }

}
