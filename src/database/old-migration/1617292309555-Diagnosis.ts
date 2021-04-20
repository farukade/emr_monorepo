import {MigrationInterface, QueryRunner} from "typeorm";

export class Diagnosis1617292309555 implements MigrationInterface {
    name = 'Diagnosis1617292309555'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "patient_diagnosis" ("id" SERIAL NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdBy" character varying(300), "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "item" jsonb NOT NULL, "patient_id" integer, "patient_request_item_id" integer, CONSTRAINT "PK_14ad82a727c31d1f6e14d16749f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "patient_diagnosis" ADD CONSTRAINT "FK_c51a8efad25e8399c018227925b" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_diagnosis" ADD CONSTRAINT "FK_2f60f14f49d2d6efd7f33916af6" FOREIGN KEY ("patient_request_item_id") REFERENCES "patient_request_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_diagnosis" DROP CONSTRAINT "FK_2f60f14f49d2d6efd7f33916af6"`);
        await queryRunner.query(`ALTER TABLE "patient_diagnosis" DROP CONSTRAINT "FK_c51a8efad25e8399c018227925b"`);
        await queryRunner.query(`DROP TABLE "patient_diagnosis"`);
    }

}
