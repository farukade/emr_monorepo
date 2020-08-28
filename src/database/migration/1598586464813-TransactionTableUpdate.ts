import {MigrationInterface, QueryRunner} from "typeorm";

export class TransactionTableUpdate1598586464813 implements MigrationInterface {
    name = 'TransactionTableUpdate1598586464813'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "transactions" ADD "hmo_approval_code" character varying`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "appointmentType"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "appointmentType" character varying NOT NULL DEFAULT 'in-patient'`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "doctorStatus"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "doctorStatus" smallint NOT NULL DEFAULT 0`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "next_location"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "next_location" character varying`, undefined);
        await queryRunner.query(`ALTER TABLE "diagnosis" ALTER COLUMN "icd10Code" DROP NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "diagnosis" DROP COLUMN "diagnosisType"`, undefined);
        await queryRunner.query(`ALTER TABLE "diagnosis" ADD "diagnosisType" character varying NOT NULL DEFAULT 10`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "diagnosis" DROP COLUMN "diagnosisType"`, undefined);
        await queryRunner.query(`ALTER TABLE "diagnosis" ADD "diagnosisType" character varying(300) NOT NULL DEFAULT 10`, undefined);
        await queryRunner.query(`ALTER TABLE "diagnosis" ALTER COLUMN "icd10Code" SET NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "next_location"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "next_location" character varying(20)`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "doctorStatus"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "doctorStatus" integer DEFAULT 0`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "appointmentType"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "appointmentType" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "hmo_approval_code"`, undefined);
    }

}
