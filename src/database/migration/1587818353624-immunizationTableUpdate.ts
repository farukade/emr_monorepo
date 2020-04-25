import {MigrationInterface, QueryRunner} from "typeorm";

export class immunizationTableUpdate1587818353624 implements MigrationInterface {
    name = 'immunizationTableUpdate1587818353624'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "administeredBy" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD CONSTRAINT "FK_61d7611a612fc2c4c86af509e35" FOREIGN KEY ("administeredBy") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "immunizations" DROP CONSTRAINT "FK_61d7611a612fc2c4c86af509e35"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "administeredBy"`, undefined);
    }

}
