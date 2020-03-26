import {MigrationInterface, QueryRunner} from "typeorm";

export class QueueTable1585210245028 implements MigrationInterface {
    name = 'QueueTable1585210245028'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "queues" ADD "status" smallint NOT NULL DEFAULT 0`, undefined);
        await queryRunner.query(`ALTER TABLE "queues" ADD "department_id" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "queues" ALTER COLUMN "queueNumber" DROP NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "queues" ADD CONSTRAINT "FK_a3424b5e8b73bb0ff259f1d44ec" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "queues" DROP CONSTRAINT "FK_a3424b5e8b73bb0ff259f1d44ec"`, undefined);
        await queryRunner.query(`ALTER TABLE "queues" ALTER COLUMN "queueNumber" SET NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "queues" DROP COLUMN "department_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "queues" DROP COLUMN "status"`, undefined);
    }

}
