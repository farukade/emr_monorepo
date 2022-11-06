import {MigrationInterface, QueryRunner} from "typeorm";

export class DbMigration1665574452945 implements MigrationInterface {
    name = 'DbMigration1665574452945'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bio_device_user" DROP CONSTRAINT "FK_eed83dd31b54e2cffd554fe95f2"`);
        await queryRunner.query(`ALTER TABLE "bio_device_user" RENAME COLUMN "staff_id" TO "patient_id"`);
        await queryRunner.query(`ALTER TABLE "bio_device_user" ADD CONSTRAINT "FK_8e4b3acc2c6d7c552337de3bc51" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bio_device_user" DROP CONSTRAINT "FK_8e4b3acc2c6d7c552337de3bc51"`);
        await queryRunner.query(`ALTER TABLE "bio_device_user" RENAME COLUMN "patient_id" TO "staff_id"`);
        await queryRunner.query(`ALTER TABLE "bio_device_user" ADD CONSTRAINT "FK_eed83dd31b54e2cffd554fe95f2" FOREIGN KEY ("staff_id") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
