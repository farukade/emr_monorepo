import {MigrationInterface, QueryRunner} from "typeorm";

export class ChatTable1663731152105 implements MigrationInterface {
    name = 'ChatTable1663731152105'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "chat_rooms" ("id" SERIAL NOT NULL, "old_id" character varying, "createdBy" character varying(300) NOT NULL DEFAULT 'admin', "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, CONSTRAINT "UQ_da0a82e8162f899dabdca236888" UNIQUE ("name"), CONSTRAINT "PK_c69082bd83bffeb71b0f455bd59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "chat_rooms_staffs_staff_details" ("chatRoomsId" integer NOT NULL, "staffDetailsId" integer NOT NULL, CONSTRAINT "PK_d38b6cfd832190f864497950547" PRIMARY KEY ("chatRoomsId", "staffDetailsId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_83f7d3e9c94ac2ece9af4f1e3e" ON "chat_rooms_staffs_staff_details" ("chatRoomsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_7dc3039b79fdb16f999fcdf498" ON "chat_rooms_staffs_staff_details" ("staffDetailsId") `);
        await queryRunner.query(`ALTER TABLE "chat" ALTER COLUMN "body" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "chat" ALTER COLUMN "recipient_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "chat" DROP COLUMN "room_id"`);
        await queryRunner.query(`ALTER TABLE "chat" ADD "room_id" integer`);
        await queryRunner.query(`ALTER TABLE "chat" ADD CONSTRAINT "FK_8aa3a52cf74c96469f0ef9fbe3e" FOREIGN KEY ("room_id") REFERENCES "chat_rooms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_rooms_staffs_staff_details" ADD CONSTRAINT "FK_83f7d3e9c94ac2ece9af4f1e3ee" FOREIGN KEY ("chatRoomsId") REFERENCES "chat_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "chat_rooms_staffs_staff_details" ADD CONSTRAINT "FK_7dc3039b79fdb16f999fcdf498c" FOREIGN KEY ("staffDetailsId") REFERENCES "staff_details"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat_rooms_staffs_staff_details" DROP CONSTRAINT "FK_7dc3039b79fdb16f999fcdf498c"`);
        await queryRunner.query(`ALTER TABLE "chat_rooms_staffs_staff_details" DROP CONSTRAINT "FK_83f7d3e9c94ac2ece9af4f1e3ee"`);
        await queryRunner.query(`ALTER TABLE "chat" DROP CONSTRAINT "FK_8aa3a52cf74c96469f0ef9fbe3e"`);
        await queryRunner.query(`ALTER TABLE "chat" DROP COLUMN "room_id"`);
        await queryRunner.query(`ALTER TABLE "chat" ADD "room_id" character varying`);
        await queryRunner.query(`ALTER TABLE "chat" ALTER COLUMN "recipient_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "chat" ALTER COLUMN "body" DROP NOT NULL`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7dc3039b79fdb16f999fcdf498"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_83f7d3e9c94ac2ece9af4f1e3e"`);
        await queryRunner.query(`DROP TABLE "chat_rooms_staffs_staff_details"`);
        await queryRunner.query(`DROP TABLE "chat_rooms"`);
    }

}
