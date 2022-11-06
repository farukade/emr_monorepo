import {MigrationInterface, QueryRunner} from "typeorm";

export class PatientRequestItem1641298663054 implements MigrationInterface {
    name = 'PatientRequestItem1641298663054'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_request_items" ADD "substitute_id" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_request_items" DROP COLUMN "substitute_id"`);
    }

}
