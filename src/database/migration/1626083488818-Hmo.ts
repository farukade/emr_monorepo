import {MigrationInterface, QueryRunner} from "typeorm";

export class Hmo1626083488818 implements MigrationInterface {
    name = 'Hmo1626083488818'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "hmos" ADD "cac_number" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "hmos" DROP COLUMN "cac_number"`);
    }

}
