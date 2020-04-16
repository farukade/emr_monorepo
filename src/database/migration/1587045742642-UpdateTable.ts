import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateTable1587045742642 implements MigrationInterface {
    name = 'UpdateTable1587045742642'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "patients" ADD "isAdmitted" boolean NOT NULL DEFAULT false`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_visits" ALTER COLUMN "fetalHeartRate" DROP NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_visits" ALTER COLUMN "positionOfFetus" DROP NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_visits" ALTER COLUMN "fetalLie" DROP NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_visits" ALTER COLUMN "relationshipToBrim" DROP NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_visits" ALTER COLUMN "comment" DROP NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_visits" DROP COLUMN "nextAppointment"`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_visits" ADD "nextAppointment" character varying`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "antenatal_visits" DROP COLUMN "nextAppointment"`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_visits" ADD "nextAppointment" TIMESTAMP NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_visits" ALTER COLUMN "comment" SET NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_visits" ALTER COLUMN "relationshipToBrim" SET NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_visits" ALTER COLUMN "fetalLie" SET NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_visits" ALTER COLUMN "positionOfFetus" SET NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_visits" ALTER COLUMN "fetalHeartRate" SET NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "isAdmitted"`, undefined);
    }

}
