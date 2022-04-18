import {MigrationInterface, QueryRunner} from "typeorm";

export class Patient1650013589320 implements MigrationInterface {
    name = 'Patient1650013589320'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patients" ADD "antenatal_id" integer`);
        await queryRunner.query(`ALTER TABLE "patients" ADD "labour_id" integer`);
        await queryRunner.query(`ALTER TABLE "patients" ADD "ivf_id" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "ivf_id"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "labour_id"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "antenatal_id"`);
    }

}
