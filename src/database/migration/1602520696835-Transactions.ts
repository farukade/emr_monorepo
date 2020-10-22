import {MigrationInterface, QueryRunner} from "typeorm";

export class Transactions1602520696835 implements MigrationInterface {
    name = 'Transactions1602520696835'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "transactions" ADD "patient_request_id" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "UQ_037e8a51b3dd187b96ce20f906a" UNIQUE ("patient_request_id")`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_037e8a51b3dd187b96ce20f906a" FOREIGN KEY ("patient_request_id") REFERENCES "patient_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_037e8a51b3dd187b96ce20f906a"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "UQ_037e8a51b3dd187b96ce20f906a"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "patient_request_id"`, undefined);
    }

}
