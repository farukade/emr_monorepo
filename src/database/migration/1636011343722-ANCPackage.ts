import {MigrationInterface, QueryRunner} from "typeorm";

export class ANCPackage1636011343722 implements MigrationInterface {
    name = 'ANCPackage1636011343722'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "antenatal_assessments" ADD "next_appointment_date" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "antenatal_assessments" DROP COLUMN "next_appointment_date"`);
    }

}
