import {MigrationInterface, QueryRunner} from "typeorm";

export class Patient1635747852593 implements MigrationInterface {
    name = 'Patient1635747852593'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patients" DROP CONSTRAINT "FK_87c1c8c706fc04db350570c7bf8"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP CONSTRAINT "REL_87c1c8c706fc04db350570c7bf"`);
        await queryRunner.query(`ALTER TABLE "patients" ADD CONSTRAINT "FK_87c1c8c706fc04db350570c7bf8" FOREIGN KEY ("next_of_kin_id") REFERENCES "patient_next_of_kins"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patients" DROP CONSTRAINT "FK_87c1c8c706fc04db350570c7bf8"`);
        await queryRunner.query(`ALTER TABLE "patients" ADD CONSTRAINT "REL_87c1c8c706fc04db350570c7bf" UNIQUE ("next_of_kin_id")`);
        await queryRunner.query(`ALTER TABLE "patients" ADD CONSTRAINT "FK_87c1c8c706fc04db350570c7bf8" FOREIGN KEY ("next_of_kin_id") REFERENCES "patient_next_of_kins"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
