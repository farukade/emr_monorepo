import {MigrationInterface, QueryRunner} from "typeorm";

export class StaffTableUpdate1581603640380 implements MigrationInterface {
    name = 'StaffTableUpdate1581603640380'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "roasters" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "period" character varying(20) NOT NULL, "department_id" uuid, CONSTRAINT "PK_1d9a023086a0d6aabac3445e735" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "roaster_items" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "schedule" jsonb NOT NULL, "roaster_id" uuid, "staff_id" uuid, CONSTRAINT "PK_19324b7f9a9acaa20c4f2eaa13b" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "staff_details" ADD "emp_code" character varying(20)`, undefined);
        await queryRunner.query(`ALTER TABLE "departments" ALTER COLUMN "description" DROP NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "roasters" ADD CONSTRAINT "FK_0457ad61a7b748a7d32ae7d14a5" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "roaster_items" ADD CONSTRAINT "FK_c951a586fe4f6c8461bd70de2dc" FOREIGN KEY ("roaster_id") REFERENCES "roasters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "roaster_items" ADD CONSTRAINT "FK_00c1999e372dfb352d07aa47b12" FOREIGN KEY ("staff_id") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "roaster_items" DROP CONSTRAINT "FK_00c1999e372dfb352d07aa47b12"`, undefined);
        await queryRunner.query(`ALTER TABLE "roaster_items" DROP CONSTRAINT "FK_c951a586fe4f6c8461bd70de2dc"`, undefined);
        await queryRunner.query(`ALTER TABLE "roasters" DROP CONSTRAINT "FK_0457ad61a7b748a7d32ae7d14a5"`, undefined);
        await queryRunner.query(`ALTER TABLE "departments" ALTER COLUMN "description" SET NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "staff_details" DROP COLUMN "emp_code"`, undefined);
        await queryRunner.query(`DROP TABLE "roaster_items"`, undefined);
        await queryRunner.query(`DROP TABLE "roasters"`, undefined);
    }

}
