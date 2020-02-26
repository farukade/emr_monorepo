import {MigrationInterface, QueryRunner} from "typeorm";

export class PatientTableUpdate1582628821705 implements MigrationInterface {
    name = 'PatientTableUpdate1582628821705'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "patients" ADD "fileNumber" character varying NOT NULL`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "fileNumber"`, undefined);
    }

}
