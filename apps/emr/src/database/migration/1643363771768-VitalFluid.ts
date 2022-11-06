import {MigrationInterface, QueryRunner} from "typeorm";

export class VitalFluid1643363771768 implements MigrationInterface {
    name = 'VitalFluid1643363771768'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_fluid_charts" ADD "admission_id" integer`);
        await queryRunner.query(`ALTER TABLE "patient_fluid_charts" ADD "nicu_id" integer`);
        await queryRunner.query(`ALTER TABLE "patient_fluid_charts" ADD "labour_id" integer`);
        await queryRunner.query(`ALTER TABLE "patient_vitals" ADD "fluid_chart_id" integer`);
        await queryRunner.query(`ALTER TABLE "patient_vitals" ADD CONSTRAINT "FK_ad058954eb78d1b9b7290ac3f68" FOREIGN KEY ("fluid_chart_id") REFERENCES "patient_fluid_charts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_vitals" DROP CONSTRAINT "FK_ad058954eb78d1b9b7290ac3f68"`);
        await queryRunner.query(`ALTER TABLE "patient_vitals" DROP COLUMN "fluid_chart_id"`);
        await queryRunner.query(`ALTER TABLE "patient_fluid_charts" DROP COLUMN "labour_id"`);
        await queryRunner.query(`ALTER TABLE "patient_fluid_charts" DROP COLUMN "nicu_id"`);
        await queryRunner.query(`ALTER TABLE "patient_fluid_charts" DROP COLUMN "admission_id"`);
    }

}
