import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdatedTables1585548663825 implements MigrationInterface {
    name = 'UpdatedTables1585548663825'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_086ea3f27fe3d9ae5198a4f254e"`, undefined);
        await queryRunner.query(`CREATE TABLE "patient_documents" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "document_type" character varying NOT NULL, "document_path" character varying NOT NULL, "patientId" uuid, CONSTRAINT "PK_e4143f9458241dc676abf823356" PRIMARY KEY ("id"))`, undefined);
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
        await queryRunner.query(`ALTER TABLE "patient_documents" ADD CONSTRAINT "FK_a7424418f442e66865f2b8e35f6" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "patient_documents" DROP CONSTRAINT "FK_a7424418f442e66865f2b8e35f6"`, undefined);
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
        await queryRunner.query(`DROP TABLE "patient_documents"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_086ea3f27fe3d9ae5198a4f254e" FOREIGN KEY ("voucher_id") REFERENCES "vouchers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

}
