import {MigrationInterface, QueryRunner} from "typeorm";

export class Document1653987997023 implements MigrationInterface {
    name = 'Document1653987997023'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_documents" ADD "cloud_uri" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_documents" DROP COLUMN "cloud_uri"`);
    }

}
