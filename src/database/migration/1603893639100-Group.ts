import {MigrationInterface, QueryRunner} from "typeorm";

export class Group1603893639100 implements MigrationInterface {
    name = 'Group1603893639100'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "lab_groups" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "name" character varying(300) NOT NULL, "lab_tests" jsonb, "price" character varying(300) NOT NULL, "slug" character varying, "description" character varying, CONSTRAINT "UQ_f5e78ab77c5668ed4f48fa873cd" UNIQUE ("name"), CONSTRAINT "PK_5096a9b6c6761573b12dcb758ad" PRIMARY KEY ("id"))`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "lab_groups"`, undefined);
    }

}
