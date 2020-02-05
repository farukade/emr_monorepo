import {MigrationInterface, QueryRunner} from "typeorm";

export class SettingsTable2Updated1580885440179 implements MigrationInterface {
    name = 'SettingsTable2Updated1580885440179'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "room_categories" ALTER COLUMN "discount" DROP NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "room_categories" DROP CONSTRAINT "UQ_5150c6a35f6921a3c3547c425a8"`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "room_categories" ADD CONSTRAINT "UQ_5150c6a35f6921a3c3547c425a8" UNIQUE ("discount")`, undefined);
        await queryRunner.query(`ALTER TABLE "room_categories" ALTER COLUMN "discount" SET NOT NULL`, undefined);
    }

}
