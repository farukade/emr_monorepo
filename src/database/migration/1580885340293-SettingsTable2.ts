import {MigrationInterface, QueryRunner} from "typeorm";

export class SettingsTable21580885340293 implements MigrationInterface {
    name = 'SettingsTable21580885340293'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "rooms" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "name" character varying(300) NOT NULL, "status" character varying, "room_category_id" uuid, CONSTRAINT "UQ_48b79438f8707f3d9ca83d85ea0" UNIQUE ("name"), CONSTRAINT "PK_0368a2d7c215f2d0458a54933f2" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "room_categories" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "name" character varying(300) NOT NULL, "price" character varying(300), "discount" character varying(300) NOT NULL, CONSTRAINT "UQ_854a1b8c447b98391125c3d1929" UNIQUE ("name"), CONSTRAINT "UQ_5150c6a35f6921a3c3547c425a8" UNIQUE ("discount"), CONSTRAINT "PK_ef520f244ee34141bd897de8009" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "rooms" ADD CONSTRAINT "FK_bd94a25a58e3979a4b575081431" FOREIGN KEY ("room_category_id") REFERENCES "room_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "rooms" DROP CONSTRAINT "FK_bd94a25a58e3979a4b575081431"`, undefined);
        await queryRunner.query(`DROP TABLE "room_categories"`, undefined);
        await queryRunner.query(`DROP TABLE "rooms"`, undefined);
    }

}
