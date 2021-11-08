import {MigrationInterface, QueryRunner} from "typeorm";

export class Antenatal1636143485622 implements MigrationInterface {
    name = 'Antenatal1636143485622'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "antenatal_assessments" ADD "appointment_id" integer`);
        await queryRunner.query(`ALTER TABLE "antenatal_assessments" ADD CONSTRAINT "UQ_ace60361c3c6fb53f46c3e72203" UNIQUE ("appointment_id")`);
        await queryRunner.query(`ALTER TABLE "antenatal_assessments" ADD CONSTRAINT "FK_ace60361c3c6fb53f46c3e72203" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "antenatal_assessments" DROP CONSTRAINT "FK_ace60361c3c6fb53f46c3e72203"`);
        await queryRunner.query(`ALTER TABLE "antenatal_assessments" DROP CONSTRAINT "UQ_ace60361c3c6fb53f46c3e72203"`);
        await queryRunner.query(`ALTER TABLE "antenatal_assessments" DROP COLUMN "appointment_id"`);
    }

}
