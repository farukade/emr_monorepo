import {MigrationInterface, QueryRunner} from "typeorm";

export class Stock1608505819295 implements MigrationInterface {
    name = 'Stock1608505819295'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "stocks" ADD "hmo_id" integer`, undefined);
        await queryRunner.query(`ALTER TABLE "stocks" ADD CONSTRAINT "FK_75149f8258ca95e1c259c4053cc" FOREIGN KEY ("hmo_id") REFERENCES "hmos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "stocks" ADD "hmoPrice" character varying`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "stocks" DROP CONSTRAINT "FK_75149f8258ca95e1c259c4053cc"`, undefined);
        await queryRunner.query(`ALTER TABLE "stocks" DROP COLUMN "hmo_id"`, undefined);
        await queryRunner.query(`ALTER TABLE "stocks" DROP COLUMN "hmoPrice"`, undefined);
    }

}
