import {MigrationInterface, QueryRunner} from "typeorm";

export class HrTables1581591585215 implements MigrationInterface {
    name = 'HrTables1581591585215'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "leave_applications" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "start_date" character varying NOT NULL, "end_date" character varying NOT NULL, "application" character varying NOT NULL, "comment" character varying, "status" integer NOT NULL DEFAULT 0, "staff_id" uuid, "leave_category_id" uuid, "applied_by" uuid, "updated_by" uuid, CONSTRAINT "PK_d986913818cf9a2943d0dbe8f56" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "staff_details" ADD "email" character varying(300) NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "staff_details" ADD CONSTRAINT "UQ_dd501689fe29851517fc1218425" UNIQUE ("email")`, undefined);
        await queryRunner.query(`ALTER TABLE "staff_details" ADD "annual_salary" character varying(300)`, undefined);
        await queryRunner.query(`ALTER TABLE "staff_details" ADD "monthly_salary" character varying(300)`, undefined);
        await queryRunner.query(`ALTER TABLE "staff_details" ADD "department_id" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "staff_details" ADD "user_id" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "staff_details" ADD CONSTRAINT "UQ_aa8db8140822a874faacaca8ea7" UNIQUE ("user_id")`, undefined);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "status" DROP NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "status" SET DEFAULT 0`, undefined);
        await queryRunner.query(`ALTER TABLE "staff_details" ADD CONSTRAINT "FK_9bea36e215c2463d28a31704a71" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "staff_details" ADD CONSTRAINT "FK_aa8db8140822a874faacaca8ea7" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "leave_applications" ADD CONSTRAINT "FK_38ebb66dd229737a003eab68125" FOREIGN KEY ("staff_id") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "leave_applications" ADD CONSTRAINT "FK_10dccbfa7f7c84f69b8abf5dadc" FOREIGN KEY ("leave_category_id") REFERENCES "leave_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "leave_applications" ADD CONSTRAINT "FK_ad22384d49f5f52a6c4b4bdf0f1" FOREIGN KEY ("applied_by") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "leave_applications" ADD CONSTRAINT "FK_eb010d2ad62fa9f54d5edd44dc6" FOREIGN KEY ("updated_by") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "leave_applications" DROP CONSTRAINT "FK_eb010d2ad62fa9f54d5edd44dc6"`, undefined);
        await queryRunner.query(`ALTER TABLE "leave_applications" DROP CONSTRAINT "FK_ad22384d49f5f52a6c4b4bdf0f1"`, undefined);
        await queryRunner.query(`ALTER TABLE "leave_applications" DROP CONSTRAINT "FK_10dccbfa7f7c84f69b8abf5dadc"`, undefined);
        await queryRunner.query(`ALTER TABLE "leave_applications" DROP CONSTRAINT "FK_38ebb66dd229737a003eab68125"`, undefined);
        await queryRunner.query(`ALTER TABLE "staff_details" DROP CONSTRAINT "FK_aa8db8140822a874faacaca8ea7"`, undefined);
        await queryRunner.query(`ALTER TABLE "staff_details" DROP CONSTRAINT "FK_9bea36e215c2463d28a31704a71"`, undefined);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "status" DROP DEFAULT`, undefined);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "status" SET NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "staff_details" DROP CONSTRAINT "UQ_aa8db8140822a874faacaca8ea7"`, undefined);
        await queryRunner.query(`ALTER TABLE "staff_details" DROP COLUMN "user_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "staff_details" DROP COLUMN "department_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "staff_details" DROP COLUMN "monthly_salary"`, undefined);
        await queryRunner.query(`ALTER TABLE "staff_details" DROP COLUMN "annual_salary"`, undefined);
        await queryRunner.query(`ALTER TABLE "staff_details" DROP CONSTRAINT "UQ_dd501689fe29851517fc1218425"`, undefined);
        await queryRunner.query(`ALTER TABLE "staff_details" DROP COLUMN "email"`, undefined);
        await queryRunner.query(`DROP TABLE "leave_applications"`, undefined);
    }

}
