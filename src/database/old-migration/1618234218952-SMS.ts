import {MigrationInterface, QueryRunner} from "typeorm";

export class SMS1618234218952 implements MigrationInterface {
    name = 'SMS1618234218952'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "sms_histories" ("id" integer NOT NULL, "to_phone" character varying(300) NOT NULL, "status" character varying(300) NOT NULL, "response" jsonb NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "PK_0478162a5bd5054b30f85116c10" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "appointment_category"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" ADD "appointment_category" character varying`);
        await queryRunner.query(`DROP TABLE "sms_histories"`);
    }

}
