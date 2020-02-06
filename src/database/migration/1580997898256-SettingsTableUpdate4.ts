import {MigrationInterface, QueryRunner} from "typeorm";

export class SettingsTableUpdate41580997898256 implements MigrationInterface {
    name = 'SettingsTableUpdate41580997898256'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "leave_categories" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "name" character varying(300) NOT NULL, CONSTRAINT "UQ_cf896a9d5b94b2ddd29f44a72cb" UNIQUE ("name"), CONSTRAINT "PK_2062dbb3add984e8ff5a0097e84" PRIMARY KEY ("id"))`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "leave_categories"`, undefined);
    }

}
