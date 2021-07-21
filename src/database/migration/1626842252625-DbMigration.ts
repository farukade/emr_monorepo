import {MigrationInterface, QueryRunner} from "typeorm";

export class DbMigration1626842252625 implements MigrationInterface {
    name = 'DbMigration1626842252625'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_requests" ADD "procedure_id" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_requests" DROP COLUMN "procedure_id"`);
    }

}
