import {MigrationInterface, QueryRunner} from "typeorm";

export class Nicu1625111340601 implements MigrationInterface {
    name = 'Nicu1625111340601'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nicu" RENAME COLUMN "room" TO "accommodation_id"`);
        await queryRunner.query(`CREATE TABLE "nicu-accommodations" ("id" SERIAL NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdBy" character varying(300), "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "name" character varying NOT NULL, "slug" character varying NOT NULL, "description" character varying, "amount" real, CONSTRAINT "PK_ddc56e9eb6b5ac330a31b68c841" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "consumables" ADD "amount" real`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "is_admitted" character varying NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ADD "status" smallint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "nicu" DROP COLUMN "accommodation_id"`);
        await queryRunner.query(`ALTER TABLE "nicu" ADD "accommodation_id" integer`);
        await queryRunner.query(`ALTER TABLE "nicu" ADD CONSTRAINT "FK_aecca2fec1a6d9a139f9a2720f8" FOREIGN KEY ("accommodation_id") REFERENCES "nicu-accommodations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nicu" DROP CONSTRAINT "FK_aecca2fec1a6d9a139f9a2720f8"`);
        await queryRunner.query(`ALTER TABLE "nicu" DROP COLUMN "accommodation_id"`);
        await queryRunner.query(`ALTER TABLE "nicu" ADD "accommodation_id" character varying`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "is_admitted"`);
        await queryRunner.query(`ALTER TABLE "consumables" DROP COLUMN "amount"`);
        await queryRunner.query(`DROP TABLE "nicu-accommodations"`);
        await queryRunner.query(`ALTER TABLE "nicu" RENAME COLUMN "accommodation_id" TO "room"`);
    }

}
