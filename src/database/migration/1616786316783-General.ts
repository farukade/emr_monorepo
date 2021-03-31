import {MigrationInterface, QueryRunner} from "typeorm";

export class General1616786316783 implements MigrationInterface {
    name = 'General1616786316783'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_request_items" ADD "document_id" integer`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" ADD CONSTRAINT "UQ_0b719c171f21c7c96c5d42a377f" UNIQUE ("document_id")`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" ADD CONSTRAINT "FK_0b719c171f21c7c96c5d42a377f" FOREIGN KEY ("document_id") REFERENCES "patient_documents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_request_items" DROP CONSTRAINT "FK_0b719c171f21c7c96c5d42a377f"`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" DROP CONSTRAINT "UQ_0b719c171f21c7c96c5d42a377f"`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" DROP COLUMN "document_id"`);
    }

}
