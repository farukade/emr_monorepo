import {MigrationInterface, QueryRunner} from "typeorm";

export class Appointment1618886723249 implements MigrationInterface {
    name = 'Appointment1618886723249'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" ADD "encounter_id" integer`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "UQ_c9f937c446704bea074b03348e3" UNIQUE ("encounter_id")`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_c9f937c446704bea074b03348e3" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_c9f937c446704bea074b03348e3"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "UQ_c9f937c446704bea074b03348e3"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "encounter_id"`);
    }

}
