import {MigrationInterface, QueryRunner} from "typeorm";

export class PatientRequestItem1666100216703 implements MigrationInterface {
    name = 'PatientRequestItem1666100216703'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_request_items" ADD "isImmediate" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_request_items" DROP COLUMN "isImmediate"`);
    }

}
