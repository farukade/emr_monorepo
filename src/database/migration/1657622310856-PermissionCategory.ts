import {MigrationInterface, QueryRunner} from "typeorm";

export class PermissionCategory1657622310856 implements MigrationInterface {
    name = 'PermissionCategory1657622310856'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "permission_categories" ("id" SERIAL NOT NULL, "old_id" character varying, "createdBy" character varying(300) NOT NULL DEFAULT 'admin', "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying(300) NOT NULL, "slug" character varying, CONSTRAINT "PK_74d37787e3657c0a4f38501fd8c" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "permission_categories"`);
    }

}
