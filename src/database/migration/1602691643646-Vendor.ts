import {MigrationInterface, QueryRunner} from "typeorm";

export class Vendor1602691643646 implements MigrationInterface {
    name = 'Vendor1602691643646'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "vendors" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "name" character varying NOT NULL, CONSTRAINT "PK_9c956c9797edfae5c6ddacc4e6e" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "stocks" ADD "vendor_id" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "stocks" ADD CONSTRAINT "FK_2369d15aa0a7cb3820284176d00" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "stocks" DROP CONSTRAINT "FK_2369d15aa0a7cb3820284176d00"`, undefined);
        await queryRunner.query(`ALTER TABLE "stocks" DROP COLUMN "vendor_id"`, undefined);
        await queryRunner.query(`DROP TABLE "vendors"`, undefined);
    }

}
