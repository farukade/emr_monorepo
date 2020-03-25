import {MigrationInterface, QueryRunner} from "typeorm";

export class PatientTableUpdate1585127845320 implements MigrationInterface {
    name = 'PatientTableUpdate1585127845320'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "patients" ADD "hmoId" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "patients" ADD CONSTRAINT "FK_30c3af8498172affc4f79345f4b" FOREIGN KEY ("hmoId") REFERENCES "hmos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "patients" DROP CONSTRAINT "FK_30c3af8498172affc4f79345f4b"`, undefined);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "hmoId"`, undefined);
    }

}
