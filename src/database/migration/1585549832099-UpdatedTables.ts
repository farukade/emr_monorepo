import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdatedTables1585549832099 implements MigrationInterface {
    name = 'UpdatedTables1585549832099'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_086ea3f27fe3d9ae5198a4f254e"`, undefined);
        await queryRunner.query(`ALTER TABLE "patient_documents" RENAME COLUMN "document_path" TO "document_name"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "voucher_amount"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "amount_paid"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "balance"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "payment_type"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "voucher_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "voucher_amount" real`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "amount_paid" real`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "balance" real`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "payment_type" character varying`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "voucher_id" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_086ea3f27fe3d9ae5198a4f254e" FOREIGN KEY ("voucher_id") REFERENCES "vouchers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_086ea3f27fe3d9ae5198a4f254e"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "voucher_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "payment_type"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "balance"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "amount_paid"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "voucher_amount"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "voucher_id" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "payment_type" character varying`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "balance" real`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "amount_paid" real`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "voucher_amount" real`, undefined);
        await queryRunner.query(`ALTER TABLE "patient_documents" RENAME COLUMN "document_name" TO "document_path"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_086ea3f27fe3d9ae5198a4f254e" FOREIGN KEY ("voucher_id") REFERENCES "vouchers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

}
