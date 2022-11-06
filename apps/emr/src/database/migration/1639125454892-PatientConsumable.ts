import {MigrationInterface, QueryRunner} from "typeorm";

export class PatientConsumable1639125454892 implements MigrationInterface {
    name = 'PatientConsumable1639125454892'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_consumables" ADD "module" character varying`);
        await queryRunner.query(`ALTER TABLE "patient_consumables" ADD "item_id" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_consumables" DROP COLUMN "item_id"`);
        await queryRunner.query(`ALTER TABLE "patient_consumables" DROP COLUMN "module"`);
    }

}
