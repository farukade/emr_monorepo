import {MigrationInterface, QueryRunner} from "typeorm";

export class ANCEnrolment1636013677807 implements MigrationInterface {
    name = 'ANCEnrolment1636013677807'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" DROP CONSTRAINT "FK_87d036bf6fb2a337f90aabc3c0e"`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" DROP CONSTRAINT "UQ_87d036bf6fb2a337f90aabc3c0e"`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ADD CONSTRAINT "FK_87d036bf6fb2a337f90aabc3c0e" FOREIGN KEY ("package_id") REFERENCES "antenatal_packages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" DROP CONSTRAINT "FK_87d036bf6fb2a337f90aabc3c0e"`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ADD CONSTRAINT "UQ_87d036bf6fb2a337f90aabc3c0e" UNIQUE ("package_id")`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ADD CONSTRAINT "FK_87d036bf6fb2a337f90aabc3c0e" FOREIGN KEY ("package_id") REFERENCES "antenatal_packages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
