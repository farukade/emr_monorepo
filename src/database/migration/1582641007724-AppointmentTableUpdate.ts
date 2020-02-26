import {MigrationInterface, QueryRunner} from "typeorm";

export class AppointmentTableUpdate1582641007724 implements MigrationInterface {
    name = 'AppointmentTableUpdate1582641007724'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_308851f63428d10577555a55c6b"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_1f8d1173481678a035b4a81a4ec"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_85318fbb8f828936521f1de5f65"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "tariff"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "discount"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "code"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "sub_category_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "category_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "whom_to_see"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "consulting_room"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "department"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "clinical_unit_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "appointment_date" character varying`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "department_id" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "specialization_id" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "consulting_room_id" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD "tariff" character varying(300)`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD "discount" character varying(300)`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD "code" character varying(20) NOT NULL DEFAULT 0`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD "sub_category_id" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD "category_id" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "refferedBy" DROP NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "referralCompany" DROP NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_8592c8a9f19602a39b5a0439972" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_6190189cadfb770db4d6f3692cc" FOREIGN KEY ("specialization_id") REFERENCES "specializations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_727da4ad68b4996775bb8314dcf" FOREIGN KEY ("consulting_room_id") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_308851f63428d10577555a55c6b" FOREIGN KEY ("sub_category_id") REFERENCES "service_sub_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_1f8d1173481678a035b4a81a4ec" FOREIGN KEY ("category_id") REFERENCES "service_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_1f8d1173481678a035b4a81a4ec"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_308851f63428d10577555a55c6b"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_727da4ad68b4996775bb8314dcf"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_6190189cadfb770db4d6f3692cc"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_8592c8a9f19602a39b5a0439972"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "referralCompany" SET NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "refferedBy" SET NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "category_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "sub_category_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "code"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "discount"`, undefined);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "tariff"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "consulting_room_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "specialization_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "department_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "appointment_date"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "clinical_unit_id" character varying`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "department" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "consulting_room" character varying`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "whom_to_see" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD "category_id" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD "sub_category_id" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD "code" character varying(20) NOT NULL DEFAULT 0`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD "discount" character varying(300)`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD "tariff" character varying(300)`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_85318fbb8f828936521f1de5f65" FOREIGN KEY ("department") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_1f8d1173481678a035b4a81a4ec" FOREIGN KEY ("category_id") REFERENCES "service_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_308851f63428d10577555a55c6b" FOREIGN KEY ("sub_category_id") REFERENCES "service_sub_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

}
