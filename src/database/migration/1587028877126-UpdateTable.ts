import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateTable1587028877126 implements MigrationInterface {
    name = 'UpdateTable1587028877126'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "lab_tests" ADD "parameters" jsonb`, undefined);
        await queryRunner.query(`ALTER TABLE "lab_tests" ADD "subTests" jsonb`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "lab_tests" DROP COLUMN "subTests"`, undefined);
        await queryRunner.query(`ALTER TABLE "lab_tests" DROP COLUMN "parameters"`, undefined);
    }

}
