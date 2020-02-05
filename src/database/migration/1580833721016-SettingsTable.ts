import {MigrationInterface, QueryRunner} from "typeorm";

export class SettingsTable1580833721016 implements MigrationInterface {
    name = 'SettingsTable1580833721016'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "departments" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "name" character varying(300) NOT NULL, "description" character varying(300) NOT NULL, CONSTRAINT "UQ_8681da666ad9699d568b3e91064" UNIQUE ("name"), CONSTRAINT "UQ_2a1fa8bd4561fb3ea0f738656a0" UNIQUE ("description"), CONSTRAINT "PK_839517a681a86bb84cbcc6a1e9d" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "lab_test_categories" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "name" character varying(300) NOT NULL, CONSTRAINT "UQ_109169066d3d8b1d1823a71f83c" UNIQUE ("name"), CONSTRAINT "PK_2085308360c1c071d1944bcff17" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "lab_tests" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "name" character varying(300) NOT NULL, "price" character varying(300) NOT NULL, "test_type" character varying NOT NULL, "lab_test_category_id" uuid, CONSTRAINT "UQ_2813b53c37eee5f383da6c2b896" UNIQUE ("name"), CONSTRAINT "PK_400d229da68540bf586c0f4a20f" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "parameters" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "name" character varying(300) NOT NULL, CONSTRAINT "UQ_2175a3ea1bb4faec90245b47418" UNIQUE ("name"), CONSTRAINT "PK_6b03a26baa3161f87fa87588859" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "lab_test_parameters" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "lab_test_id" uuid, "sub_test_id" uuid, "parameter_id" uuid, CONSTRAINT "PK_8c7d822ce6d7618f199dd2c7957" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "name" character varying(300) NOT NULL, "description" character varying(300), CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "roles_permissions" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "role_id" uuid, "permission_id" uuid, CONSTRAINT "PK_298f2c0e2ea45289aa0c4ac8a02" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "permissions" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "name" character varying(300) NOT NULL, CONSTRAINT "UQ_48ce552495d14eae9b187bb6716" UNIQUE ("name"), CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "services" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "name" character varying(300) NOT NULL, "tariff" character varying(300), "service_category_id" uuid, CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "service_categories" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "name" character varying(300) NOT NULL, CONSTRAINT "UQ_7ef2e28b495d09a4eb28997c653" UNIQUE ("name"), CONSTRAINT "PK_fe4da5476c4ffe5aa2d3524ae68" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "lab_tests" ADD CONSTRAINT "FK_6b2484465696867bf540811bb34" FOREIGN KEY ("lab_test_category_id") REFERENCES "lab_test_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "lab_test_parameters" ADD CONSTRAINT "FK_781df05fa4e44562068143ad8ed" FOREIGN KEY ("lab_test_id") REFERENCES "lab_tests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "lab_test_parameters" ADD CONSTRAINT "FK_49a9257f93681e6ee97d84f135a" FOREIGN KEY ("sub_test_id") REFERENCES "lab_tests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "lab_test_parameters" ADD CONSTRAINT "FK_e0f1a0758a0551240541c5b81b3" FOREIGN KEY ("parameter_id") REFERENCES "parameters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "roles_permissions" ADD CONSTRAINT "FK_7d2dad9f14eddeb09c256fea719" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "roles_permissions" ADD CONSTRAINT "FK_337aa8dba227a1fe6b73998307b" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_14851b54bbbbe691aa4c8184b32" FOREIGN KEY ("service_category_id") REFERENCES "service_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_14851b54bbbbe691aa4c8184b32"`, undefined);
        await queryRunner.query(`ALTER TABLE "roles_permissions" DROP CONSTRAINT "FK_337aa8dba227a1fe6b73998307b"`, undefined);
        await queryRunner.query(`ALTER TABLE "roles_permissions" DROP CONSTRAINT "FK_7d2dad9f14eddeb09c256fea719"`, undefined);
        await queryRunner.query(`ALTER TABLE "lab_test_parameters" DROP CONSTRAINT "FK_e0f1a0758a0551240541c5b81b3"`, undefined);
        await queryRunner.query(`ALTER TABLE "lab_test_parameters" DROP CONSTRAINT "FK_49a9257f93681e6ee97d84f135a"`, undefined);
        await queryRunner.query(`ALTER TABLE "lab_test_parameters" DROP CONSTRAINT "FK_781df05fa4e44562068143ad8ed"`, undefined);
        await queryRunner.query(`ALTER TABLE "lab_tests" DROP CONSTRAINT "FK_6b2484465696867bf540811bb34"`, undefined);
        await queryRunner.query(`DROP TABLE "service_categories"`, undefined);
        await queryRunner.query(`DROP TABLE "services"`, undefined);
        await queryRunner.query(`DROP TABLE "permissions"`, undefined);
        await queryRunner.query(`DROP TABLE "roles_permissions"`, undefined);
        await queryRunner.query(`DROP TABLE "roles"`, undefined);
        await queryRunner.query(`DROP TABLE "lab_test_parameters"`, undefined);
        await queryRunner.query(`DROP TABLE "parameters"`, undefined);
        await queryRunner.query(`DROP TABLE "lab_tests"`, undefined);
        await queryRunner.query(`DROP TABLE "lab_test_categories"`, undefined);
        await queryRunner.query(`DROP TABLE "departments"`, undefined);
    }

}
