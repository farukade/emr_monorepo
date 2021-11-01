import {MigrationInterface, QueryRunner} from "typeorm";

export class Accommodation1635617484938 implements MigrationInterface {
    name = 'Accommodation1635617484938'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nicu-accommodations" ADD "quantity_unused" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nicu-accommodations" DROP COLUMN "quantity_unused"`);
    }

}
