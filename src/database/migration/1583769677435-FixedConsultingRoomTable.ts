import {MigrationInterface, QueryRunner} from "typeorm";

export class FixedConsultingRoomTable1583769677435 implements MigrationInterface {
    name = 'FixedConsultingRoomTable1583769677435'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "consulting_rooms" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "name" character varying(300) NOT NULL, CONSTRAINT "PK_847797ba4210a8d1b2b92114bfe" PRIMARY KEY ("id"))`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "consulting_rooms"`, undefined);
    }

}
