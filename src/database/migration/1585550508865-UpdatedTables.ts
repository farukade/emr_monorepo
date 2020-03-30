import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdatedTables1585550508865 implements MigrationInterface {
    name = 'UpdatedTables1585550508865'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_086ea3f27fe3d9ae5198a4f254e"`, undefined);
        await queryRunner.query(`ALTER TABLE "patient_documents" DROP CONSTRAINT "FK_a7424418f442e66865f2b8e35f6"`, undefined);
        await queryRunner.query(`ALTER TABLE "patient_documents" RENAME COLUMN "patientId" TO "requestId"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "voucher_amount"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "amount_paid"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "balance"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "payment_type"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "voucher_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "patient_documents" DROP COLUMN "requestId"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "voucher_amount" real`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "amount_paid" real`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "balance" real`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "payment_type" character varying`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "voucher_id" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "patient_documents" ADD "patientId" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "patient_documents" ADD "requestId" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_086ea3f27fe3d9ae5198a4f254e" FOREIGN KEY ("voucher_id") REFERENCES "vouchers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "patient_documents" ADD CONSTRAINT "FK_a7424418f442e66865f2b8e35f6" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "patient_documents" ADD CONSTRAINT "FK_832780a6e86550c594bd4e1201e" FOREIGN KEY ("requestId") REFERENCES "patient_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "patient_documents" DROP CONSTRAINT "FK_832780a6e86550c594bd4e1201e"`, undefined);
        await queryRunner.query(`ALTER TABLE "patient_documents" DROP CONSTRAINT "FK_a7424418f442e66865f2b8e35f6"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_086ea3f27fe3d9ae5198a4f254e"`, undefined);
        await queryRunner.query(`ALTER TABLE "patient_documents" DROP COLUMN "requestId"`, undefined);
        await queryRunner.query(`ALTER TABLE "patient_documents" DROP COLUMN "patientId"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "voucher_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "payment_type"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "balance"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "amount_paid"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "voucher_amount"`, undefined);
        await queryRunner.query(`ALTER TABLE "patient_documents" ADD "requestId" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "voucher_id" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "payment_type" character varying`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "balance" real`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "amount_paid" real`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "voucher_amount" real`, undefined);
        await queryRunner.query(`ALTER TABLE "patient_documents" RENAME COLUMN "requestId" TO "patientId"`, undefined);
        await queryRunner.query(`ALTER TABLE "patient_documents" ADD CONSTRAINT "FK_a7424418f442e66865f2b8e35f6" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_086ea3f27fe3d9ae5198a4f254e" FOREIGN KEY ("voucher_id") REFERENCES "vouchers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

}
