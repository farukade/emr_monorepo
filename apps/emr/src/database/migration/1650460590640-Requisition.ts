import {MigrationInterface, QueryRunner} from "typeorm";

export class Requisition1650460590640 implements MigrationInterface {
    name = 'Requisition1650460590640'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "requisitions" ADD "department_id" integer`);
        await queryRunner.query(`ALTER TABLE "requisitions" ADD CONSTRAINT "FK_966fb1dba0e2595fbd2f327327f" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "requisitions" DROP CONSTRAINT "FK_966fb1dba0e2595fbd2f327327f"`);
        await queryRunner.query(`ALTER TABLE "requisitions" DROP COLUMN "department_id"`);
    }

}
