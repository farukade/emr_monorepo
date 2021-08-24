import {MigrationInterface, QueryRunner} from "typeorm";

export class DbStaff1629388897932 implements MigrationInterface {
    name = 'DbStaff1629388897932'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patients" ADD "title" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "title"`);
    }

}
