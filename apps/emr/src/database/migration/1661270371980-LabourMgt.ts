import {MigrationInterface, QueryRunner} from "typeorm";

export class LabourMgt1661270371980 implements MigrationInterface {
    name = 'LabourMgt1661270371980'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "labour_enrollments" ADD "delivered" smallint NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "labour_enrollments" DROP COLUMN "delivered"`);
    }

}
