import {MigrationInterface, QueryRunner} from "typeorm";

export class RequestTable1585153180489 implements MigrationInterface {
    name = 'RequestTable1585153180489'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "patients" DROP CONSTRAINT "FK_30c3af8498172affc4f79345f4b"`, undefined);
        await queryRunner.query(`CREATE TABLE "request_types" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "name" character varying(300) NOT NULL, "group" character varying(300) NOT NULL, CONSTRAINT "PK_795c261c2ebf6beb3f417acd40b" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "hmoId"`, undefined);
        await queryRunner.query(`ALTER TABLE "patients" ADD "hmoId" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "patients" ADD CONSTRAINT "FK_30c3af8498172affc4f79345f4b" FOREIGN KEY ("hmoId") REFERENCES "hmos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "patients" DROP CONSTRAINT "FK_30c3af8498172affc4f79345f4b"`, undefined);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "hmoId"`, undefined);
        await queryRunner.query(`ALTER TABLE "patients" ADD "hmoId" uuid`, undefined);
        await queryRunner.query(`DROP TABLE "request_types"`, undefined);
        await queryRunner.query(`ALTER TABLE "patients" ADD CONSTRAINT "FK_30c3af8498172affc4f79345f4b" FOREIGN KEY ("hmoId") REFERENCES "hmos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

}
