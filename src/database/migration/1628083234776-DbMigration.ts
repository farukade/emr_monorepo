import {MigrationInterface, QueryRunner} from "typeorm";

export class DbMigration1628083234776 implements MigrationInterface {
    name = 'DbMigration1628083234776'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_diagnoses" ADD "admission_id" integer`);
        await queryRunner.query(`ALTER TABLE "patient_review_of_systems" ADD "admission_id" integer`);
        await queryRunner.query(`ALTER TABLE "patient_diagnoses" ADD CONSTRAINT "FK_f609ab73bbf1592577bfe712c3e" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_review_of_systems" ADD CONSTRAINT "FK_32646ee4bf946cff8e3dd5aaea2" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_review_of_systems" DROP CONSTRAINT "FK_32646ee4bf946cff8e3dd5aaea2"`);
        await queryRunner.query(`ALTER TABLE "patient_diagnoses" DROP CONSTRAINT "FK_f609ab73bbf1592577bfe712c3e"`);
        await queryRunner.query(`ALTER TABLE "patient_review_of_systems" DROP COLUMN "admission_id"`);
        await queryRunner.query(`ALTER TABLE "patient_diagnoses" DROP COLUMN "admission_id"`);
    }

}
