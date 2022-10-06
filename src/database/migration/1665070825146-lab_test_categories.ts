import {MigrationInterface, QueryRunner} from "typeorm";

export class labTestCategories1665070825146 implements MigrationInterface {
    name = 'labTestCategories1665070825146'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lab_test_categories" ADD "duration" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lab_test_categories" DROP COLUMN "duration"`);
    }

}
