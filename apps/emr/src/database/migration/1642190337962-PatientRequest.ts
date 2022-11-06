import {MigrationInterface, QueryRunner} from "typeorm";

export class PatientRequest1642190337962 implements MigrationInterface {
    name = 'PatientRequest1642190337962'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_requests" ADD "serial_code" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_requests" DROP COLUMN "serial_code"`);
    }

}
