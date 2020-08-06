import {MigrationInterface, QueryRunner} from "typeorm";

export class QueueTableUpdate1596717137283 implements MigrationInterface {
    name = 'QueueTableUpdate1596717137283'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_6190189cadfb770db4d6f3692cc"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_8592c8a9f19602a39b5a0439972"`, undefined);
        await queryRunner.query(`ALTER TABLE "queues" DROP CONSTRAINT "FK_a3424b5e8b73bb0ff259f1d44ec"`, undefined);
        await queryRunner.query(`ALTER TABLE "queues" RENAME COLUMN "department_id" TO "queueType"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "department_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "specialization_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "amountToPay" real NOT NULL DEFAULT 0`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "doctor_id" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "queues" DROP COLUMN "queueType"`, undefined);
        await queryRunner.query(`ALTER TABLE "queues" ADD "queueType" character varying NOT NULL DEFAULT 0`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_4cf26c3f972d014df5c68d503d2" FOREIGN KEY ("doctor_id") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_4cf26c3f972d014df5c68d503d2"`, undefined);
        await queryRunner.query(`ALTER TABLE "queues" DROP COLUMN "queueType"`, undefined);
        await queryRunner.query(`ALTER TABLE "queues" ADD "queueType" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "doctor_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "amountToPay"`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "specialization_id" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "department_id" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "queues" RENAME COLUMN "queueType" TO "department_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "queues" ADD CONSTRAINT "FK_a3424b5e8b73bb0ff259f1d44ec" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_8592c8a9f19602a39b5a0439972" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_6190189cadfb770db4d6f3692cc" FOREIGN KEY ("specialization_id") REFERENCES "specializations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

}
