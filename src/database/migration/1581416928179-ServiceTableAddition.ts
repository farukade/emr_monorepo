import {MigrationInterface, QueryRunner} from "typeorm";

export class ServiceTableAddition1581416928179 implements MigrationInterface {
    name = 'ServiceTableAddition1581416928179'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_14851b54bbbbe691aa4c8184b32"`, undefined);
        await queryRunner.query(`CREATE TABLE "service_sub_categories" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "name" character varying(300) NOT NULL, "service_category_id" uuid, CONSTRAINT "UQ_02b89162fa0c78085074014b03d" UNIQUE ("name"), CONSTRAINT "PK_77088e713b588ce29936f4b575b" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "service_category_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD "discount" character varying(300)`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD "sub_category_id" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD "category_id" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "service_categories" ADD "notes" character varying`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_308851f63428d10577555a55c6b" FOREIGN KEY ("sub_category_id") REFERENCES "service_sub_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_1f8d1173481678a035b4a81a4ec" FOREIGN KEY ("category_id") REFERENCES "service_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "service_sub_categories" ADD CONSTRAINT "FK_bd5c0bd5ef8474fdaff153f656b" FOREIGN KEY ("service_category_id") REFERENCES "service_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "service_sub_categories" DROP CONSTRAINT "FK_bd5c0bd5ef8474fdaff153f656b"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_1f8d1173481678a035b4a81a4ec"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_308851f63428d10577555a55c6b"`, undefined);
        await queryRunner.query(`ALTER TABLE "service_categories" DROP COLUMN "notes"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "category_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "sub_category_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "discount"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD "service_category_id" uuid`, undefined);
        await queryRunner.query(`DROP TABLE "service_sub_categories"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_14851b54bbbbe691aa4c8184b32" FOREIGN KEY ("service_category_id") REFERENCES "service_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

}
