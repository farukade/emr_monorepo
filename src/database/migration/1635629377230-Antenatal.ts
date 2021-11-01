import {MigrationInterface, QueryRunner} from "typeorm";

export class Antenatal1635629377230 implements MigrationInterface {
    name = 'Antenatal1635629377230'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" DROP COLUMN "obstericsHistory"`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" DROP COLUMN "bookingPeriod"`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" DROP COLUMN "requiredCare"`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" DROP COLUMN "l_m_p"`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" DROP COLUMN "lmpSource"`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" DROP COLUMN "e_o_d"`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" DROP COLUMN "fathersInfo"`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" DROP COLUMN "previousPregnancy"`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" DROP COLUMN "enrollmentPackage"`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ADD "booking_period" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ADD "doctors" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ADD "lmp" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ADD "lmp_source" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ADD "eod" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ADD "father" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ADD "history" jsonb NOT NULL`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ADD "pregnancy_history" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ADD "package_id" integer`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ADD CONSTRAINT "UQ_87d036bf6fb2a337f90aabc3c0e" UNIQUE ("package_id")`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ADD CONSTRAINT "FK_87d036bf6fb2a337f90aabc3c0e" FOREIGN KEY ("package_id") REFERENCES "antenatal_packages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" DROP CONSTRAINT "FK_87d036bf6fb2a337f90aabc3c0e"`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" DROP CONSTRAINT "UQ_87d036bf6fb2a337f90aabc3c0e"`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" DROP COLUMN "package_id"`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" DROP COLUMN "pregnancy_history"`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" DROP COLUMN "history"`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" DROP COLUMN "father"`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" DROP COLUMN "eod"`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" DROP COLUMN "lmp_source"`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" DROP COLUMN "lmp"`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" DROP COLUMN "doctors"`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" DROP COLUMN "booking_period"`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ADD "enrollmentPackage" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ADD "previousPregnancy" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ADD "fathersInfo" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ADD "e_o_d" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ADD "lmpSource" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ADD "l_m_p" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ADD "requiredCare" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ADD "bookingPeriod" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ADD "obstericsHistory" jsonb NOT NULL`);
    }

}
