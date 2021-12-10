import {MigrationInterface, QueryRunner} from "typeorm";

export class ANCEnroll1639153150821 implements MigrationInterface {
    name = 'ANCEnroll1639153150821'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ALTER COLUMN "booking_period" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ALTER COLUMN "lmp_source" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ALTER COLUMN "lmp_source" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ALTER COLUMN "booking_period" SET NOT NULL`);
    }

}
