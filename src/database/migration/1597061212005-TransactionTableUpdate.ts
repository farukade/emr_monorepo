import {MigrationInterface, QueryRunner} from "typeorm";

export class TransactionTableUpdate1597061212005 implements MigrationInterface {
    name = 'TransactionTableUpdate1597061212005'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_6525e03ba06d33dc052ad77363a"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" RENAME COLUMN "department_id" TO "next_location"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "next_location"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "next_location" character varying`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "next_location"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "next_location" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" RENAME COLUMN "next_location" TO "department_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_6525e03ba06d33dc052ad77363a" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

}
