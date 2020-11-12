import {MigrationInterface, QueryRunner} from "typeorm";

export class Nicu1603393527216 implements MigrationInterface {
    name = 'Nicu1603393527216'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "staff_details" DROP CONSTRAINT "FK_aa8db8140822a874faacaca8ea7"`, undefined);
        await queryRunner.query(`CREATE TABLE "nicu" ("id" SERIAL NOT NULL, "temperature" double precision NOT NULL, "pulse" double precision NOT NULL, "resp" double precision NOT NULL, "sp02" character varying NOT NULL, "oxygen" character varying NOT NULL, "cypap" character varying NOT NULL, "offoxygen" character varying NOT NULL, "remark" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "PK_dabecf28a7aadc5694b54b6856c" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "patients" ADD "isStaff" boolean NOT NULL DEFAULT false`, undefined);
        await queryRunner.query(`ALTER TABLE "staff_details" ADD CONSTRAINT "FK_aa8db8140822a874faacaca8ea7" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "staff_details" DROP CONSTRAINT "FK_aa8db8140822a874faacaca8ea7"`, undefined);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "isStaff"`, undefined);
        await queryRunner.query(`DROP TABLE "nicu"`, undefined);
        await queryRunner.query(`ALTER TABLE "staff_details" ADD CONSTRAINT "FK_aa8db8140822a874faacaca8ea7" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

}
