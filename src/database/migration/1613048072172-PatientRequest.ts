import {MigrationInterface, QueryRunner} from "typeorm";

export class PatientRequest1613048072172 implements MigrationInterface {
    name = 'PatientRequest1613048072172'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_037e8a51b3dd187b96ce20f906a"`);
        await queryRunner.query(`ALTER TABLE "transactions" RENAME COLUMN "patient_request_id" TO "patient_request_item_id"`);
        await queryRunner.query(`ALTER TABLE "transactions" RENAME CONSTRAINT "REL_037e8a51b3dd187b96ce20f906" TO "UQ_75f8e75a828cb64ea9016e52732"`);
        await queryRunner.query(`CREATE TABLE "patient_request_items" ("id" SERIAL NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdBy" character varying(300), "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "filled" smallint NOT NULL DEFAULT '0', "filled_by" character varying(300), "filled_at" character varying, "cancelled" smallint NOT NULL DEFAULT '0', "cancelled_by" character varying(300), "cancelled_at" character varying, "received" smallint NOT NULL DEFAULT '0', "received_by" character varying(300), "received_at" character varying, "approved" smallint NOT NULL DEFAULT '0', "approved_by" character varying(300), "approved_at" character varying, "parameters" jsonb, "result" character varying, "note" character varying, "request_id" integer, "lab_test_id" integer, "drug_id" integer, "service_id" integer, CONSTRAINT "PK_22154ed518ee5498d2db3dbbf3d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" ADD CONSTRAINT "FK_a4fa7f03aee8fa57de0a2a4cb08" FOREIGN KEY ("request_id") REFERENCES "patient_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" ADD CONSTRAINT "FK_cbed537706bbf99bcd4fb65598c" FOREIGN KEY ("lab_test_id") REFERENCES "lab_tests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" ADD CONSTRAINT "FK_6d66a27b72d34e216e1ab8e8b5b" FOREIGN KEY ("drug_id") REFERENCES "stocks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" ADD CONSTRAINT "FK_2b7ae8c84df71bdbe91812e712f" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_75f8e75a828cb64ea9016e52732" FOREIGN KEY ("patient_request_item_id") REFERENCES "patient_request_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_75f8e75a828cb64ea9016e52732"`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" DROP CONSTRAINT "FK_2b7ae8c84df71bdbe91812e712f"`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" DROP CONSTRAINT "FK_6d66a27b72d34e216e1ab8e8b5b"`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" DROP CONSTRAINT "FK_cbed537706bbf99bcd4fb65598c"`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" DROP CONSTRAINT "FK_a4fa7f03aee8fa57de0a2a4cb08"`);
        await queryRunner.query(`DROP TABLE "patient_request_items"`);
        await queryRunner.query(`ALTER TABLE "transactions" RENAME CONSTRAINT "UQ_75f8e75a828cb64ea9016e52732" TO "REL_037e8a51b3dd187b96ce20f906"`);
        await queryRunner.query(`ALTER TABLE "transactions" RENAME COLUMN "patient_request_item_id" TO "patient_request_id"`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_037e8a51b3dd187b96ce20f906a" FOREIGN KEY ("patient_request_id") REFERENCES "patient_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
