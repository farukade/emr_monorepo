import {MigrationInterface, QueryRunner} from "typeorm";

export class Ancnrolmnt1636139794025 implements MigrationInterface {
    name = 'Ancnrolmnt1636139794025'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "antenatal_assessments" DROP CONSTRAINT "FK_813b966256226378a2bc1259511"`);
        await queryRunner.query(`ALTER TABLE "antenatal_assessments" DROP CONSTRAINT "REL_813b966256226378a2bc125951"`);
        await queryRunner.query(`ALTER TABLE "antenatal_assessments" ADD CONSTRAINT "FK_813b966256226378a2bc1259511" FOREIGN KEY ("antenatal_enrollment_id") REFERENCES "antenatal_enrollments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "antenatal_assessments" DROP CONSTRAINT "FK_813b966256226378a2bc1259511"`);
        await queryRunner.query(`ALTER TABLE "antenatal_assessments" ADD CONSTRAINT "REL_813b966256226378a2bc125951" UNIQUE ("antenatal_enrollment_id")`);
        await queryRunner.query(`ALTER TABLE "antenatal_assessments" ADD CONSTRAINT "FK_813b966256226378a2bc1259511" FOREIGN KEY ("antenatal_enrollment_id") REFERENCES "antenatal_enrollments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
