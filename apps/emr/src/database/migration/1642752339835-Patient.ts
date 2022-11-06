import {MigrationInterface, QueryRunner} from "typeorm";

export class Patient1642752339835 implements MigrationInterface {
    name = 'Patient1642752339835'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patients" ADD "enrollee_id" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "enrollee_id"`);
    }

}
