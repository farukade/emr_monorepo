import {MigrationInterface, QueryRunner} from "typeorm";

export class IVF1625137228490 implements MigrationInterface {
    name = 'IVF1625137228490'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ivf_enrollments" DROP CONSTRAINT "FK_ef82975899e44ad20880f065f03"`);
        await queryRunner.query(`ALTER TABLE "ivf_enrollments" DROP CONSTRAINT "FK_be8585d58ba962936e181023e5d"`);
        await queryRunner.query(`ALTER TABLE "ivf_enrollments" DROP COLUMN "wife_patient_id"`);
        await queryRunner.query(`ALTER TABLE "ivf_enrollments" DROP COLUMN "husband_patient_id"`);
        await queryRunner.query(`ALTER TABLE "ivf_enrollments" ADD "wife_id" integer`);
        await queryRunner.query(`ALTER TABLE "ivf_enrollments" ADD "husband_id" integer`);
        await queryRunner.query(`ALTER TABLE "ivf_enrollments" ADD CONSTRAINT "FK_39d4400ee85b9d1584c7b14bb6e" FOREIGN KEY ("wife_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ivf_enrollments" ADD CONSTRAINT "FK_f6e7d29dc3f9a84ac01d1d4b599" FOREIGN KEY ("husband_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ivf_enrollments" DROP CONSTRAINT "FK_f6e7d29dc3f9a84ac01d1d4b599"`);
        await queryRunner.query(`ALTER TABLE "ivf_enrollments" DROP CONSTRAINT "FK_39d4400ee85b9d1584c7b14bb6e"`);
        await queryRunner.query(`ALTER TABLE "ivf_enrollments" DROP COLUMN "husband_id"`);
        await queryRunner.query(`ALTER TABLE "ivf_enrollments" DROP COLUMN "wife_id"`);
        await queryRunner.query(`ALTER TABLE "ivf_enrollments" ADD "husband_patient_id" integer`);
        await queryRunner.query(`ALTER TABLE "ivf_enrollments" ADD "wife_patient_id" integer`);
        await queryRunner.query(`ALTER TABLE "ivf_enrollments" ADD CONSTRAINT "FK_be8585d58ba962936e181023e5d" FOREIGN KEY ("wife_patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ivf_enrollments" ADD CONSTRAINT "FK_ef82975899e44ad20880f065f03" FOREIGN KEY ("husband_patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
