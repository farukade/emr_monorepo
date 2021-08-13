import {MigrationInterface, QueryRunner} from "typeorm";

export class Transaction1628864740149 implements MigrationInterface {
    name = 'Transaction1628864740149'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" ADD "admission_id" integer`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_3f1fa849a47d06236e8c93c058a" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_3f1fa849a47d06236e8c93c058a"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "admission_id"`);
    }

}
