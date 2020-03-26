import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdatedTables1585239360284 implements MigrationInterface {
    name = 'UpdatedTables1585239360284'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "hmo_rates" ADD "comment" character varying`, undefined);
        await queryRunner.query(`ALTER TABLE "patient_requests" ADD "status" smallint NOT NULL DEFAULT 0`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "patient_requests" DROP COLUMN "status"`, undefined);
        await queryRunner.query(`ALTER TABLE "hmo_rates" DROP COLUMN "comment"`, undefined);
    }
}
