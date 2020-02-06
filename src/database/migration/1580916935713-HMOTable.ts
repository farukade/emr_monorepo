import {MigrationInterface, QueryRunner} from "typeorm";

export class HMOTable1580916935713 implements MigrationInterface {
    name = 'HMOTable1580916935713'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "hmos" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "name" character varying(300) NOT NULL, "logo" character varying(300), "address" character varying(300), "phoneNumber" character varying(300), "email" character varying(300), CONSTRAINT "UQ_cb55dee33dc56b781ae06d099f6" UNIQUE ("name"), CONSTRAINT "PK_5bb4a0559fe6f4bfb4991f29e00" PRIMARY KEY ("id"))`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "hmos"`, undefined);
    }

}
