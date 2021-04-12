import {MigrationInterface, QueryRunner} from "typeorm";

export class Queue1617874180188 implements MigrationInterface {
    name = 'Queue1617874180188'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "queues" ADD "patient_id" integer`);
        await queryRunner.query(`ALTER TABLE "queues" ADD CONSTRAINT "FK_f7edfc4fe9f2a59335dde80ab6f" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "queues" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "queues" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "queues" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "queues" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "queues" DROP CONSTRAINT "FK_f7edfc4fe9f2a59335dde80ab6f"`);
        await queryRunner.query(`ALTER TABLE "queues" DROP COLUMN "patient_id"`);
        await queryRunner.query(`ALTER TABLE "queues" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "queues" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "queues" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "queues" DROP COLUMN "deleted_at"`);
    }

}
