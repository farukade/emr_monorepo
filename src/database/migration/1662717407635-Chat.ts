import {MigrationInterface, QueryRunner} from "typeorm";

export class Chat1662717407635 implements MigrationInterface {
    name = 'Chat1662717407635'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "chat" ("id" SERIAL NOT NULL, "old_id" character varying, "createdBy" character varying(300) NOT NULL DEFAULT 'admin', "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "body" character varying, "sender_id" integer NOT NULL, "recipient_id" integer NOT NULL, "chat_id" character varying, "room_id" character varying, "is_delivered" boolean NOT NULL DEFAULT false, "is_sent" boolean NOT NULL DEFAULT false, "is_read" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_9d0b2ba74336710fd31154738a5" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "chat"`);
    }

}
