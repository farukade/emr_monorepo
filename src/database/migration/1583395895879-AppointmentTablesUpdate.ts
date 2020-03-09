import {MigrationInterface, QueryRunner} from "typeorm";

export class AppointmentTablesUpdate1583395895879 implements MigrationInterface {
    name = 'AppointmentTablesUpdate1583395895879'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_308851f63428d10577555a55c6b"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_1f8d1173481678a035b4a81a4ec"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "tariff"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "discount"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "code"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "sub_category_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "category_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD "tariff" character varying(300)`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD "discount" character varying(300)`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD "code" character varying(20) NOT NULL DEFAULT 0`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD "sub_category_id" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD "category_id" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "status"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "status" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_308851f63428d10577555a55c6b" FOREIGN KEY ("sub_category_id") REFERENCES "service_sub_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_1f8d1173481678a035b4a81a4ec" FOREIGN KEY ("category_id") REFERENCES "service_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_1f8d1173481678a035b4a81a4ec"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_308851f63428d10577555a55c6b"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "status"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "status" smallint NOT NULL DEFAULT 0`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "category_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "sub_category_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "code"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "discount"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "tariff"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD "category_id" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD "sub_category_id" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD "code" character varying(20) NOT NULL DEFAULT 0`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD "discount" character varying(300)`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD "tariff" character varying(300)`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_1f8d1173481678a035b4a81a4ec" FOREIGN KEY ("category_id") REFERENCES "service_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_308851f63428d10577555a55c6b" FOREIGN KEY ("sub_category_id") REFERENCES "service_sub_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

}
