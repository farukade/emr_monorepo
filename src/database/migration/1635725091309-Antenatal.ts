import {MigrationInterface, QueryRunner} from "typeorm";

export class Antenatal1635725091309 implements MigrationInterface {
    name = 'Antenatal1635725091309'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" RENAME COLUMN "eod" TO "edd"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" RENAME COLUMN "edd" TO "eod"`);
    }

}
