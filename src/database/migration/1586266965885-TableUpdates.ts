import {MigrationInterface, QueryRunner} from "typeorm";

export class TableUpdates1586266965885 implements MigrationInterface {
    name = 'TableUpdates1586266965885'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "queues" DROP CONSTRAINT "FK_231453f99d29d2eaeb8eb5d90d5"`, undefined);
        await queryRunner.query(`ALTER TABLE "queues" DROP CONSTRAINT "REL_231453f99d29d2eaeb8eb5d90d"`, undefined);
        await queryRunner.query(`ALTER TABLE "queues" ADD CONSTRAINT "FK_231453f99d29d2eaeb8eb5d90d5" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "queues" DROP CONSTRAINT "FK_231453f99d29d2eaeb8eb5d90d5"`, undefined);
        await queryRunner.query(`ALTER TABLE "queues" ADD CONSTRAINT "REL_231453f99d29d2eaeb8eb5d90d" UNIQUE ("appointment_id")`, undefined);
        await queryRunner.query(`ALTER TABLE "queues" ADD CONSTRAINT "FK_231453f99d29d2eaeb8eb5d90d5" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

}
