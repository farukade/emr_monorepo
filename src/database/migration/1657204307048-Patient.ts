import {MigrationInterface, QueryRunner} from "typeorm";

export class Patient1657204307048 implements MigrationInterface {
    name = 'Patient1657204307048'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_cdd7d6051a46bbfb8a54544a5f" ON "patients" ("legacy_patient_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_a0c874cde9f34400a79c05dd90" ON "patients" ("surname") `);
        await queryRunner.query(`CREATE INDEX "IDX_dba14c30be7cdfb02a0953dea7" ON "patients" ("other_names") `);
        await queryRunner.query(`CREATE INDEX "IDX_9d1297a7e4cea1d695fc050eec" ON "patients" ("phone_number") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_9d1297a7e4cea1d695fc050eec"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dba14c30be7cdfb02a0953dea7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a0c874cde9f34400a79c05dd90"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cdd7d6051a46bbfb8a54544a5f"`);
    }

}
