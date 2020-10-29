import {MigrationInterface, QueryRunner} from "typeorm";

export class Specimen1603892921106 implements MigrationInterface {
    name = 'Specimen1603892921106'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "lab_specimens" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "name" character varying(300) NOT NULL, CONSTRAINT "UQ_68d46b9b111e30d5384e1731b52" UNIQUE ("name"), CONSTRAINT "PK_5d0cc7be2233e4fe80ec0c7259d" PRIMARY KEY ("id"))`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "lab_specimens"`, undefined);
    }

}
