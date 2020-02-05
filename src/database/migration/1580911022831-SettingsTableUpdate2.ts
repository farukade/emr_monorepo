import {MigrationInterface, QueryRunner} from "typeorm";

export class SettingsTableUpdate21580911022831 implements MigrationInterface {
    name = 'SettingsTableUpdate21580911022831'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "lab_tests" ADD "description" character varying`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "lab_tests" DROP COLUMN "description"`, undefined);
    }

}
