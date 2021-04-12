import {MigrationInterface, QueryRunner} from "typeorm";

export class General1617953089655 implements MigrationInterface {
    name = 'General1617953089655'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_request_items" ADD "transaction_id" integer`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" ADD CONSTRAINT "UQ_8fda24dd9ea981f7f8aa7f15e86" UNIQUE ("transaction_id")`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" ADD CONSTRAINT "FK_8fda24dd9ea981f7f8aa7f15e86" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_request_items" DROP CONSTRAINT "FK_8fda24dd9ea981f7f8aa7f15e86"`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" DROP CONSTRAINT "UQ_8fda24dd9ea981f7f8aa7f15e86"`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" DROP COLUMN "transaction_id"`);
    }

}
