import {MigrationInterface, QueryRunner} from "typeorm";

export class SpecializationsTable1582201882891 implements MigrationInterface {
    name = 'SpecializationsTable1582201882891'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "specializations" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "name" character varying(300) NOT NULL, CONSTRAINT "UQ_68ccfdea9eca4570f9aa5454b25" UNIQUE ("name"), CONSTRAINT "PK_1d4b2b9ff96a76def0bf7195a8f" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "staff_details" ADD "is_consultant" boolean NOT NULL DEFAULT false`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "staff_details" DROP COLUMN "is_consultant"`, undefined);
        await queryRunner.query(`DROP TABLE "specializations"`, undefined);
    }

}
