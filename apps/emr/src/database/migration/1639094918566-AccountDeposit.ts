import {MigrationInterface, QueryRunner} from "typeorm";

export class AccountDeposit1639094918566 implements MigrationInterface {
    name = 'AccountDeposit1639094918566'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "account_deposits" ("id" SERIAL NOT NULL, "old_id" character varying, "createdBy" character varying(300) NOT NULL DEFAULT 'it-admin', "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "amount" real NOT NULL DEFAULT '0', "patient_id" integer, "staff_id" integer, "transaction_id" integer, CONSTRAINT "REL_4793f35d53da1ca2597a3951a0" UNIQUE ("transaction_id"), CONSTRAINT "PK_f089fe296ae2088c4b1217b76dc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "account_deposits" ADD CONSTRAINT "FK_b69e5f49fa50218fa1a758a7f22" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "account_deposits" ADD CONSTRAINT "FK_c111ecfcd3837003887569a5bcf" FOREIGN KEY ("staff_id") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "account_deposits" ADD CONSTRAINT "FK_4793f35d53da1ca2597a3951a07" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "account_deposits" DROP CONSTRAINT "FK_4793f35d53da1ca2597a3951a07"`);
        await queryRunner.query(`ALTER TABLE "account_deposits" DROP CONSTRAINT "FK_c111ecfcd3837003887569a5bcf"`);
        await queryRunner.query(`ALTER TABLE "account_deposits" DROP CONSTRAINT "FK_b69e5f49fa50218fa1a758a7f22"`);
        await queryRunner.query(`DROP TABLE "account_deposits"`);
    }

}
