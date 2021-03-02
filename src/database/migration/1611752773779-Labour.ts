import {MigrationInterface, QueryRunner} from "typeorm";

export class Labour1611752773779 implements MigrationInterface {
    name = 'Labour1611752773779'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "labour_measurements" DROP CONSTRAINT "FK_fde2037d9915be7816cfce60295"`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" RENAME COLUMN "enrollementId" TO "enrollmentId"`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" ADD CONSTRAINT "FK_6803a1e2c5fb855dcfa3695ff80" FOREIGN KEY ("enrollmentId") REFERENCES "labour_enrollments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "labour_measurements" DROP CONSTRAINT "FK_6803a1e2c5fb855dcfa3695ff80"`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" RENAME COLUMN "enrollmentId" TO "enrollementId"`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" ADD CONSTRAINT "FK_fde2037d9915be7816cfce60295" FOREIGN KEY ("enrollementId") REFERENCES "labour_enrollments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
