import {MigrationInterface, QueryRunner} from "typeorm";

export class Antenatal1635722177254 implements MigrationInterface {
    name = 'Antenatal1635722177254'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ADD "serial_code" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" DROP COLUMN "doctors"`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ADD "doctors" jsonb NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" DROP COLUMN "doctors"`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ADD "doctors" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" DROP COLUMN "serial_code"`);
    }

}
