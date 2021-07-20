import {MigrationInterface, QueryRunner} from "typeorm";

export class DbMigration1626751124925 implements MigrationInterface {
    name = 'DbMigration1626751124925'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_requests" DROP CONSTRAINT "FK_55f9252cfcc72a14047e7c2c329"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_037e8a51b3dd187b96ce20f906a"`);
        await queryRunner.query(`ALTER TABLE "patient_requests" DROP CONSTRAINT "REL_55f9252cfcc72a14047e7c2c32"`);
        await queryRunner.query(`ALTER TABLE "patient_requests" DROP COLUMN "transaction_id"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "patient_request_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" ADD "patient_request_id" integer`);
        await queryRunner.query(`ALTER TABLE "patient_requests" ADD "transaction_id" integer`);
        await queryRunner.query(`ALTER TABLE "patient_requests" ADD CONSTRAINT "REL_55f9252cfcc72a14047e7c2c32" UNIQUE ("transaction_id")`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_037e8a51b3dd187b96ce20f906a" FOREIGN KEY ("patient_request_id") REFERENCES "patient_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_requests" ADD CONSTRAINT "FK_55f9252cfcc72a14047e7c2c329" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
