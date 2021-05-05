import {MigrationInterface, QueryRunner} from "typeorm";

export class FluidChart1620230876406 implements MigrationInterface {
    name = 'FluidChart1620230876406'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "patient_fluid_charts" ("id" SERIAL NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdBy" character varying(300), "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "type" character varying, "fluid_route" character varying, "volume" real, "patient_id" integer, CONSTRAINT "PK_3179a510482b2dfab51de705535" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "patient_fluid_charts" ADD CONSTRAINT "FK_9f97839f404c046f661703671e7" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_fluid_charts" DROP CONSTRAINT "FK_9f97839f404c046f661703671e7"`);
        await queryRunner.query(`DROP TABLE "patient_fluid_charts"`);
    }

}
