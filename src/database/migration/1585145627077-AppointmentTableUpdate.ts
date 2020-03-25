import {MigrationInterface, QueryRunner} from "typeorm";

export class AppointmentTableUpdate1585145627077 implements MigrationInterface {
    name = 'AppointmentTableUpdate1585145627077'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "patients" DROP CONSTRAINT "FK_30c3af8498172affc4f79345f4b"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" RENAME COLUMN "appointment_type" TO "serviceTypeId"`, undefined);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "hmoId"`, undefined);
        await queryRunner.query(`ALTER TABLE "patients" ADD "hmoId" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "serviceTypeId"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "serviceTypeId" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "patients" ADD CONSTRAINT "FK_30c3af8498172affc4f79345f4b" FOREIGN KEY ("hmoId") REFERENCES "hmos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_746f877b36f6d4ffeba23d5e599" FOREIGN KEY ("serviceTypeId") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_746f877b36f6d4ffeba23d5e599"`, undefined);
        await queryRunner.query(`ALTER TABLE "patients" DROP CONSTRAINT "FK_30c3af8498172affc4f79345f4b"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "serviceTypeId"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "serviceTypeId" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "hmoId"`, undefined);
        await queryRunner.query(`ALTER TABLE "patients" ADD "hmoId" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" RENAME COLUMN "serviceTypeId" TO "appointment_type"`, undefined);
        await queryRunner.query(`ALTER TABLE "patients" ADD CONSTRAINT "FK_30c3af8498172affc4f79345f4b" FOREIGN KEY ("hmoId") REFERENCES "hmos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

}
