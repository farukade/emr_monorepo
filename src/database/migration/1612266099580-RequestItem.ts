import {MigrationInterface, QueryRunner} from "typeorm";

export class RequestItem1612266099580 implements MigrationInterface {
    name = 'RequestItem1612266099580'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "patient_request_items" ("id" SERIAL NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdBy" character varying(300), "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "request_id" integer, "lab_test_id" integer, "drug_id" integer, "service_id" integer, CONSTRAINT "PK_22154ed518ee5498d2db3dbbf3d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" ADD CONSTRAINT "FK_a4fa7f03aee8fa57de0a2a4cb08" FOREIGN KEY ("request_id") REFERENCES "patient_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" ADD CONSTRAINT "FK_cbed537706bbf99bcd4fb65598c" FOREIGN KEY ("lab_test_id") REFERENCES "lab_tests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" ADD CONSTRAINT "FK_6d66a27b72d34e216e1ab8e8b5b" FOREIGN KEY ("drug_id") REFERENCES "stocks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" ADD CONSTRAINT "FK_2b7ae8c84df71bdbe91812e712f" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_request_items" DROP CONSTRAINT "FK_2b7ae8c84df71bdbe91812e712f"`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" DROP CONSTRAINT "FK_6d66a27b72d34e216e1ab8e8b5b"`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" DROP CONSTRAINT "FK_cbed537706bbf99bcd4fb65598c"`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" DROP CONSTRAINT "FK_a4fa7f03aee8fa57de0a2a4cb08"`);
        await queryRunner.query(`DROP TABLE "patient_request_items"`);
    }

}
