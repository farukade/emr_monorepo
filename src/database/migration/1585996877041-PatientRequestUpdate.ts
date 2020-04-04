import {MigrationInterface, QueryRunner} from "typeorm";

export class PatientRequestUpdate1585996877041 implements MigrationInterface {
    name = 'PatientRequestUpdate1585996877041'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "patient_requests" DROP CONSTRAINT "FK_f4cb50cc7501d995322dc94adcb"`, undefined);
        await queryRunner.query(`ALTER TABLE "patient_requests" RENAME COLUMN "patientId" TO "patient_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "patient_requests" ADD CONSTRAINT "FK_da5beb6b397a69eec37ccba9959" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "patient_requests" DROP CONSTRAINT "FK_da5beb6b397a69eec37ccba9959"`, undefined);
        await queryRunner.query(`ALTER TABLE "patient_requests" RENAME COLUMN "patient_id" TO "patientId"`, undefined);
        await queryRunner.query(`ALTER TABLE "patient_requests" ADD CONSTRAINT "FK_f4cb50cc7501d995322dc94adcb" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

}
