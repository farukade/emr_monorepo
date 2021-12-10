import {MigrationInterface, QueryRunner} from "typeorm";

export class PatientConsumable1639130605075 implements MigrationInterface {
    name = 'PatientConsumable1639130605075'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_consumables" RENAME COLUMN "requestNote" TO "request_note"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_consumables" RENAME COLUMN "request_note" TO "requestNote"`);
    }

}
