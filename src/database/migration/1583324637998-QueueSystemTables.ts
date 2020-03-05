import {MigrationInterface, QueryRunner} from "typeorm";

export class QueueSystemTables1583324637998 implements MigrationInterface {
    name = 'QueueSystemTables1583324637998'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "departments" DROP CONSTRAINT "FK_e23b53ba71d839edcd7f7a527c3"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_308851f63428d10577555a55c6b"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_1f8d1173481678a035b4a81a4ec"`, undefined);
        await queryRunner.query(`CREATE TABLE "queues" ("id" integer NOT NULL, "queueNumber" integer NOT NULL, "patientName" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "appointment_id" uuid, CONSTRAINT "REL_231453f99d29d2eaeb8eb5d90d" UNIQUE ("appointment_id"), CONSTRAINT "PK_d966f9eb39a9396658387071bb3" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "tariff"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "discount"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "code"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "sub_category_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "category_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "status" smallint NOT NULL DEFAULT 0`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD "tariff" character varying(300)`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD "discount" character varying(300)`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD "code" character varying(20) NOT NULL DEFAULT 0`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD "sub_category_id" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD "category_id" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "departments" ADD CONSTRAINT "FK_e23b53ba71d839edcd7f7a527c3" FOREIGN KEY ("hod_id") REFERENCES "staff_details"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "queues" ADD CONSTRAINT "FK_231453f99d29d2eaeb8eb5d90d5" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_308851f63428d10577555a55c6b" FOREIGN KEY ("sub_category_id") REFERENCES "service_sub_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_1f8d1173481678a035b4a81a4ec" FOREIGN KEY ("category_id") REFERENCES "service_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_1f8d1173481678a035b4a81a4ec"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_308851f63428d10577555a55c6b"`, undefined);
        await queryRunner.query(`ALTER TABLE "queues" DROP CONSTRAINT "FK_231453f99d29d2eaeb8eb5d90d5"`, undefined);
        await queryRunner.query(`ALTER TABLE "departments" DROP CONSTRAINT "FK_e23b53ba71d839edcd7f7a527c3"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "category_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "sub_category_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "code"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "discount"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "tariff"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "status"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD "category_id" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD "sub_category_id" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD "code" character varying(20) NOT NULL DEFAULT 0`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD "discount" character varying(300)`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD "tariff" character varying(300)`, undefined);
        await queryRunner.query(`DROP TABLE "queues"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_1f8d1173481678a035b4a81a4ec" FOREIGN KEY ("category_id") REFERENCES "service_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_308851f63428d10577555a55c6b" FOREIGN KEY ("sub_category_id") REFERENCES "service_sub_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "departments" ADD CONSTRAINT "FK_e23b53ba71d839edcd7f7a527c3" FOREIGN KEY ("hod_id") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

}
