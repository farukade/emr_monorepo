import {MigrationInterface, QueryRunner} from "typeorm";

export class Requisition1627638431310 implements MigrationInterface {
    name = 'Requisition1627638431310'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "requisitions" DROP CONSTRAINT "FK_2f95c0a2f8d773fcea4121a4dd9"`);
        await queryRunner.query(`ALTER TABLE "requisitions" DROP COLUMN "drug_batch_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "requisitions" ADD "drug_batch_id" integer`);
        await queryRunner.query(`ALTER TABLE "requisitions" ADD CONSTRAINT "FK_2f95c0a2f8d773fcea4121a4dd9" FOREIGN KEY ("drug_batch_id") REFERENCES "drug_batches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
