import {MigrationInterface, QueryRunner} from "typeorm";

export class TransactionsTable1585245408552 implements MigrationInterface {
    name = 'TransactionsTable1585245408552'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "transactions" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "amount" real, "description" character varying, "status" smallint NOT NULL DEFAULT 0, "patient_id" uuid, "service_id" uuid, "department_id" uuid, CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_ed0f03c517b2f5173041fbdac69" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_f68d402ddc5eb2498ec7385a44c" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_6525e03ba06d33dc052ad77363a" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_6525e03ba06d33dc052ad77363a"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_f68d402ddc5eb2498ec7385a44c"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_ed0f03c517b2f5173041fbdac69"`, undefined);
        await queryRunner.query(`DROP TABLE "transactions"`, undefined);
    }

}
