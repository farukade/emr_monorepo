import {MigrationInterface, QueryRunner} from "typeorm";

export class AppointmentTableUpdate1593896475437 implements MigrationInterface {
    name = 'AppointmentTableUpdate1593896475437'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "encounters" DROP COLUMN "investigations"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "husbandName"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "husbandPhoneNo"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "bloodGroup"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "parity"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "alive"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "miscarriage"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "presentPregnancy"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "lmp"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "encounterId" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "UQ_34ae7b81d65e4d2a859a52b45b2" UNIQUE ("encounterId")`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "transaction_details" jsonb`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_34ae7b81d65e4d2a859a52b45b2" FOREIGN KEY ("encounterId") REFERENCES "encounters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_34ae7b81d65e4d2a859a52b45b2"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "transaction_details"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "UQ_34ae7b81d65e4d2a859a52b45b2"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "encounterId"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "lmp" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "presentPregnancy" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "miscarriage" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "alive" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "parity" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "bloodGroup" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "husbandPhoneNo" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "husbandName" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "encounters" ADD "investigations" text`, undefined);
    }

}
