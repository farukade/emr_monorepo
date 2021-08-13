import {MigrationInterface, QueryRunner} from "typeorm";

export class Admission1628861921704 implements MigrationInterface {
    name = 'Admission1628861921704'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admissions" DROP CONSTRAINT "FK_c214c4f17b3dc003c263ccc655d"`);
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "room_assigned_by"`);
        await queryRunner.query(`ALTER TABLE "admissions" ADD "room_assigned_by" character varying`);
        await queryRunner.query(`ALTER TABLE "admissions" ALTER COLUMN "reason" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admissions" ALTER COLUMN "reason" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "room_assigned_by"`);
        await queryRunner.query(`ALTER TABLE "admissions" ADD "room_assigned_by" integer`);
        await queryRunner.query(`ALTER TABLE "admissions" ADD CONSTRAINT "FK_c214c4f17b3dc003c263ccc655d" FOREIGN KEY ("room_assigned_by") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
