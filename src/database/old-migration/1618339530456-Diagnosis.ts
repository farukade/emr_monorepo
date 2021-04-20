import {MigrationInterface, QueryRunner} from "typeorm";

export class Diagnosis1618339530456 implements MigrationInterface {
    name = 'Diagnosis1618339530456'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_diagnosis" ADD "status" character varying NOT NULL DEFAULT 'Active'`);
        await queryRunner.query(`ALTER TABLE "patient_diagnosis" ADD "encounter_id" integer`);
        await queryRunner.query(`ALTER TABLE "patient_diagnosis" ADD CONSTRAINT "FK_da605a4483ab8d5f85b652a6049" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_diagnosis" DROP CONSTRAINT "FK_da605a4483ab8d5f85b652a6049"`);
        await queryRunner.query(`ALTER TABLE "patient_diagnosis" DROP COLUMN "encounter_id"`);
        await queryRunner.query(`ALTER TABLE "patient_diagnosis" DROP COLUMN "status"`);
    }

}
