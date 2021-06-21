import {MigrationInterface, QueryRunner} from "typeorm";

export class PatientRequest1623925887593 implements MigrationInterface {
    name = 'PatientRequest1623925887593'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_requests" ADD "procedure_id" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_requests" DROP COLUMN "procedure_id"`);
    }

}
