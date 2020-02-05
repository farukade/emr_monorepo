import {MigrationInterface, QueryRunner} from "typeorm";

export class SettingsTableUpdate31580911706853 implements MigrationInterface {
    name = 'SettingsTableUpdate31580911706853'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "lab_test_parameters" ALTER COLUMN "referenceRange" DROP NOT NULL`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "lab_test_parameters" ALTER COLUMN "referenceRange" SET NOT NULL`, undefined);
    }

}
