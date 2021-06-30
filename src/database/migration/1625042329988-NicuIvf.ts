import {MigrationInterface, QueryRunner} from "typeorm";

export class NicuIvf1625042329988 implements MigrationInterface {
    name = 'NicuIvf1625042329988'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ivf_enrollments" ADD "status" smallint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "nicu" ADD "admission_id" integer`);
        await queryRunner.query(`ALTER TABLE "admissions" ALTER COLUMN "status" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "nicu" ADD CONSTRAINT "FK_04d64f533435cc27fc6502916da" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nicu" DROP CONSTRAINT "FK_04d64f533435cc27fc6502916da"`);
        await queryRunner.query(`ALTER TABLE "admissions" ALTER COLUMN "status" SET DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "nicu" DROP COLUMN "admission_id"`);
        await queryRunner.query(`ALTER TABLE "ivf_enrollments" DROP COLUMN "status"`);
    }

}
