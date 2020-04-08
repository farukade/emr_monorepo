import {MigrationInterface, QueryRunner} from "typeorm";

export class TableUpdates1586220176711 implements MigrationInterface {
    name = 'TableUpdates1586220176711'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "patient_next_of_kins" ADD "relationship" character varying`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "service_category_id" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "hmo_approval_status" smallint NOT NULL DEFAULT 0`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_43e5abd5273cb482b23f2968ef0" FOREIGN KEY ("service_category_id") REFERENCES "service_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_43e5abd5273cb482b23f2968ef0"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "hmo_approval_status"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "service_category_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "patient_next_of_kins" DROP COLUMN "relationship"`, undefined);
    }

}
