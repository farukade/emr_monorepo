import {MigrationInterface, QueryRunner} from "typeorm";

export class PatentRequestTable1584713623608 implements MigrationInterface {
    name = 'PatentRequestTable1584713623608'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "patient_requests" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "requestType" character varying NOT NULL, "requestBody" jsonb NOT NULL, "patientId" uuid, CONSTRAINT "PK_f8e8da73419bd59af78b143cb6b" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "patient_requests" ADD CONSTRAINT "FK_f4cb50cc7501d995322dc94adcb" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "patient_requests" DROP CONSTRAINT "FK_f4cb50cc7501d995322dc94adcb"`, undefined);
        await queryRunner.query(`DROP TABLE "patient_requests"`, undefined);
    }

}
