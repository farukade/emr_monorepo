import {MigrationInterface, QueryRunner} from "typeorm";

export class SettingsTableUpdate1580909590264 implements MigrationInterface {
    name = 'SettingsTableUpdate1580909590264'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "parameters" DROP COLUMN "referenceRange"`, undefined);
        await queryRunner.query(`ALTER TABLE "lab_test_parameters" ADD "referenceRange" character varying(300) NOT NULL`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "lab_test_parameters" DROP COLUMN "referenceRange"`, undefined);
        await queryRunner.query(`ALTER TABLE "parameters" ADD "referenceRange" character varying(300) NOT NULL`, undefined);
    }

}
