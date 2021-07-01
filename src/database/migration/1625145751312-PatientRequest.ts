import {MigrationInterface, QueryRunner} from "typeorm";

export class PatientRequest1625145751312 implements MigrationInterface {
    name = 'PatientRequest1625145751312'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_requests" ADD "antenatal_id" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_requests" DROP COLUMN "antenatal_id"`);
    }

}
