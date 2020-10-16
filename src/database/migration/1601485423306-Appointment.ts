import {MigrationInterface, QueryRunner} from "typeorm";

export class Appointment1601485423306 implements MigrationInterface {
    name = 'Appointment1601485423306'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "appointments" ADD "canSeeDoctor" smallint NOT NULL DEFAULT 0`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "transaction_id" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "UQ_01350f837207f9df74346a9c764" UNIQUE ("transaction_id")`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_01350f837207f9df74346a9c764" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_01350f837207f9df74346a9c764"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "UQ_01350f837207f9df74346a9c764"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "transaction_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "canSeeDoctor"`, undefined);
    }

}
