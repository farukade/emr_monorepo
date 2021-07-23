import {MigrationInterface, QueryRunner} from "typeorm";

export class DbMigration1627049686079 implements MigrationInterface {
    name = 'DbMigration1627049686079'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_consumables" DROP CONSTRAINT "FK_22a7741e736c9b6d6e2546d5b86"`);
        await queryRunner.query(`ALTER TABLE "store_inventories" ADD "code" character varying`);
        await queryRunner.query(`ALTER TABLE "patient_consumables" ADD CONSTRAINT "FK_22a7741e736c9b6d6e2546d5b86" FOREIGN KEY ("consumable_id") REFERENCES "store_inventories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_consumables" DROP CONSTRAINT "FK_22a7741e736c9b6d6e2546d5b86"`);
        await queryRunner.query(`ALTER TABLE "store_inventories" DROP COLUMN "code"`);
        await queryRunner.query(`ALTER TABLE "patient_consumables" ADD CONSTRAINT "FK_22a7741e736c9b6d6e2546d5b86" FOREIGN KEY ("consumable_id") REFERENCES "consumables"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
