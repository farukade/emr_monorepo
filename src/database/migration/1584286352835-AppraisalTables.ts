import {MigrationInterface, QueryRunner} from "typeorm";

export class AppraisalTables1584286352835 implements MigrationInterface {
    name = 'AppraisalTables1584286352835'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "performance_appraisal_periods" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "performancePeriod" character varying NOT NULL, "startDate" character varying NOT NULL, "endDate" character varying NOT NULL, CONSTRAINT "PK_f83b0f2ac1cfa3f04e29a217ea1" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "performance_indicators" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "keyFocus" character varying NOT NULL, "objective" character varying NOT NULL, "kpis" text NOT NULL, "weight" character varying NOT NULL, "appraisalId" uuid, CONSTRAINT "PK_eba47f8a079325ef5b18cffa7bb" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "performance_appraisals" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "staff_id" uuid, "line_manager_id" uuid, "department_id" uuid, CONSTRAINT "PK_3632321ee51ce723fd17b393567" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "performance_comments" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "employeeComment" character varying, "lineManagerComment" character varying, "recommendation" character varying, "appraisalId" uuid, "periodId" uuid, CONSTRAINT "PK_24ea71800b211258f29df057f3f" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "performance_indicator_reports" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "selfAssessment" character varying, "lineManagerAssessment" character varying, "appraisalId" uuid, "indicatorId" uuid, "periodId" uuid, CONSTRAINT "PK_ece779fa3aa4a5076d4fd991f61" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "supervisor_evalutions" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "topic" character varying NOT NULL, "sectionTitle" character varying NOT NULL, "items" json NOT NULL, CONSTRAINT "PK_3671b33b76a7953a7ddf19cc32a" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "supervisor_evaluation_reports" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "topic" character varying NOT NULL, "sectionTitle" character varying NOT NULL, "answers" json NOT NULL, "evaluatorComment" character varying NOT NULL, "staff_id" uuid, "evaluator_id" uuid, CONSTRAINT "PK_c6199f487c56f47f78f38596ef7" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "performance_indicators" ADD CONSTRAINT "FK_a853927a5a1dca065c051ecefbe" FOREIGN KEY ("appraisalId") REFERENCES "performance_appraisals"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "performance_appraisals" ADD CONSTRAINT "FK_9a7e32e6ad4040fcec067250abe" FOREIGN KEY ("staff_id") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "performance_appraisals" ADD CONSTRAINT "FK_11b3d061cca4817d79a72ea6729" FOREIGN KEY ("line_manager_id") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "performance_appraisals" ADD CONSTRAINT "FK_759a6670a24ede81b29706412e1" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "performance_comments" ADD CONSTRAINT "FK_36c3ac2f2dffb9f1c11fd15f7e4" FOREIGN KEY ("appraisalId") REFERENCES "performance_appraisals"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "performance_comments" ADD CONSTRAINT "FK_e85c0a5fef9118af73113b77140" FOREIGN KEY ("periodId") REFERENCES "performance_appraisal_periods"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "performance_indicator_reports" ADD CONSTRAINT "FK_4b0b662afd40e71f0d1e89d99ed" FOREIGN KEY ("appraisalId") REFERENCES "performance_appraisals"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "performance_indicator_reports" ADD CONSTRAINT "FK_4cd73fba917755e679d3313e159" FOREIGN KEY ("indicatorId") REFERENCES "performance_indicators"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "performance_indicator_reports" ADD CONSTRAINT "FK_0f6c9ef219ac52010a45d706cdd" FOREIGN KEY ("periodId") REFERENCES "performance_appraisal_periods"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "supervisor_evaluation_reports" ADD CONSTRAINT "FK_a1c691dbc523b5352d907b078db" FOREIGN KEY ("staff_id") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "supervisor_evaluation_reports" ADD CONSTRAINT "FK_1e0d9b807b41d6cf4414fe70885" FOREIGN KEY ("evaluator_id") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "supervisor_evaluation_reports" DROP CONSTRAINT "FK_1e0d9b807b41d6cf4414fe70885"`, undefined);
        await queryRunner.query(`ALTER TABLE "supervisor_evaluation_reports" DROP CONSTRAINT "FK_a1c691dbc523b5352d907b078db"`, undefined);
        await queryRunner.query(`ALTER TABLE "performance_indicator_reports" DROP CONSTRAINT "FK_0f6c9ef219ac52010a45d706cdd"`, undefined);
        await queryRunner.query(`ALTER TABLE "performance_indicator_reports" DROP CONSTRAINT "FK_4cd73fba917755e679d3313e159"`, undefined);
        await queryRunner.query(`ALTER TABLE "performance_indicator_reports" DROP CONSTRAINT "FK_4b0b662afd40e71f0d1e89d99ed"`, undefined);
        await queryRunner.query(`ALTER TABLE "performance_comments" DROP CONSTRAINT "FK_e85c0a5fef9118af73113b77140"`, undefined);
        await queryRunner.query(`ALTER TABLE "performance_comments" DROP CONSTRAINT "FK_36c3ac2f2dffb9f1c11fd15f7e4"`, undefined);
        await queryRunner.query(`ALTER TABLE "performance_appraisals" DROP CONSTRAINT "FK_759a6670a24ede81b29706412e1"`, undefined);
        await queryRunner.query(`ALTER TABLE "performance_appraisals" DROP CONSTRAINT "FK_11b3d061cca4817d79a72ea6729"`, undefined);
        await queryRunner.query(`ALTER TABLE "performance_appraisals" DROP CONSTRAINT "FK_9a7e32e6ad4040fcec067250abe"`, undefined);
        await queryRunner.query(`ALTER TABLE "performance_indicators" DROP CONSTRAINT "FK_a853927a5a1dca065c051ecefbe"`, undefined);
        await queryRunner.query(`DROP TABLE "supervisor_evaluation_reports"`, undefined);
        await queryRunner.query(`DROP TABLE "supervisor_evalutions"`, undefined);
        await queryRunner.query(`DROP TABLE "performance_indicator_reports"`, undefined);
        await queryRunner.query(`DROP TABLE "performance_comments"`, undefined);
        await queryRunner.query(`DROP TABLE "performance_appraisals"`, undefined);
        await queryRunner.query(`DROP TABLE "performance_indicators"`, undefined);
        await queryRunner.query(`DROP TABLE "performance_appraisal_periods"`, undefined);
    }

}
