import {MigrationInterface, QueryRunner} from "typeorm";

export class Patient1657203499248 implements MigrationInterface {
    name = 'Patient1657203499248'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patients" ADD "mother_id" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "mother_id"`);
    }

}
