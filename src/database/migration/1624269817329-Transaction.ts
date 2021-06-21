import {MigrationInterface, QueryRunner} from "typeorm";

export class Transaction1624269817329 implements MigrationInterface {
    name = 'Transaction1624269817329'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" RENAME COLUMN "hmo_approval_status" TO "hmo_id"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "hmo_id"`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "hmo_id" integer`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_8f36418f9f5faa21ee2944206c8" FOREIGN KEY ("hmo_id") REFERENCES "hmos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_8f36418f9f5faa21ee2944206c8"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "hmo_id"`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "hmo_id" smallint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "transactions" RENAME COLUMN "hmo_id" TO "hmo_approval_status"`);
    }

}
