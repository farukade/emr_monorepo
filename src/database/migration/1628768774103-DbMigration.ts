import {MigrationInterface, QueryRunner} from "typeorm";

export class DbMigration1628768774103 implements MigrationInterface {
    name = 'DbMigration1628768774103'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_requests" DROP CONSTRAINT "FK_b095c6d783df453149b886fcd8c"`);
        await queryRunner.query(`ALTER TABLE "patient_requests" DROP CONSTRAINT "REL_b095c6d783df453149b886fcd8"`);
        await queryRunner.query(`ALTER TABLE "patient_requests" ADD CONSTRAINT "FK_b095c6d783df453149b886fcd8c" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_requests" DROP CONSTRAINT "FK_b095c6d783df453149b886fcd8c"`);
        await queryRunner.query(`ALTER TABLE "patient_requests" ADD CONSTRAINT "REL_b095c6d783df453149b886fcd8" UNIQUE ("admission_id")`);
        await queryRunner.query(`ALTER TABLE "patient_requests" ADD CONSTRAINT "FK_b095c6d783df453149b886fcd8c" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
