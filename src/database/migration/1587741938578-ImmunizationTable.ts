import {MigrationInterface, QueryRunner} from "typeorm";

export class ImmunizationTable1587741938578 implements MigrationInterface {
    name = 'ImmunizationTable1587741938578'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "immunizations" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "typeOfVaccine" character varying NOT NULL, "dateOfAdministration" character varying NOT NULL, "vaccineBatchNo" character varying NOT NULL, "prescription" character varying NOT NULL, "nextVisitDate" character varying NOT NULL, "patientId" uuid, CONSTRAINT "PK_d6ef20ce9b42402adbbd1e260fe" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD CONSTRAINT "FK_8fbe789e9830c8beb9c39de4540" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "immunizations" DROP CONSTRAINT "FK_8fbe789e9830c8beb9c39de4540"`, undefined);
        await queryRunner.query(`DROP TABLE "immunizations"`, undefined);
    }

}
