import {MigrationInterface, QueryRunner} from "typeorm";

export class ANCEnrollment1650106051543 implements MigrationInterface {
    name = 'ANCEnrollment1650106051543'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ALTER COLUMN "history" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ALTER COLUMN "history" SET NOT NULL`);
    }

}
