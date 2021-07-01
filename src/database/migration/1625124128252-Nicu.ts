import {MigrationInterface, QueryRunner} from "typeorm";

export class Nicu1625124128252 implements MigrationInterface {
    name = 'Nicu1625124128252'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admissions" ADD "nicu_id" integer`);
        await queryRunner.query(`ALTER TABLE "admissions" ADD CONSTRAINT "UQ_ead945020abc516c15034100035" UNIQUE ("nicu_id")`);
        await queryRunner.query(`ALTER TABLE "nicu" DROP CONSTRAINT "FK_04d64f533435cc27fc6502916da"`);
        await queryRunner.query(`ALTER TABLE "nicu" ADD CONSTRAINT "UQ_04d64f533435cc27fc6502916da" UNIQUE ("admission_id")`);
        await queryRunner.query(`ALTER TABLE "nicu" ADD CONSTRAINT "FK_04d64f533435cc27fc6502916da" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admissions" ADD CONSTRAINT "FK_ead945020abc516c15034100035" FOREIGN KEY ("nicu_id") REFERENCES "nicu"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admissions" DROP CONSTRAINT "FK_ead945020abc516c15034100035"`);
        await queryRunner.query(`ALTER TABLE "nicu" DROP CONSTRAINT "FK_04d64f533435cc27fc6502916da"`);
        await queryRunner.query(`ALTER TABLE "nicu" DROP CONSTRAINT "UQ_04d64f533435cc27fc6502916da"`);
        await queryRunner.query(`ALTER TABLE "nicu" ADD CONSTRAINT "FK_04d64f533435cc27fc6502916da" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admissions" DROP CONSTRAINT "UQ_ead945020abc516c15034100035"`);
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "nicu_id"`);
    }

}
