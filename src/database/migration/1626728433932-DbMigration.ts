import {MigrationInterface, QueryRunner} from "typeorm";

export class DbMigration1626728433932 implements MigrationInterface {
    name = 'DbMigration1626728433932'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lab_tests" DROP CONSTRAINT "FK_f5a991c6c21925590fb61cacae4"`);
        await queryRunner.query(`ALTER TABLE "lab_groups" DROP CONSTRAINT "FK_57666c94216936030cbd02d1925"`);
        await queryRunner.query(`ALTER TABLE "lab_tests" DROP COLUMN "hmo_scheme_id"`);
        await queryRunner.query(`ALTER TABLE "lab_tests" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "lab_tests" DROP COLUMN "test_type"`);
        await queryRunner.query(`ALTER TABLE "lab_tests" DROP COLUMN "slug"`);
        await queryRunner.query(`ALTER TABLE "lab_tests" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "lab_tests" DROP COLUMN "hmoPrice"`);
        await queryRunner.query(`ALTER TABLE "lab_groups" DROP COLUMN "hmo_scheme_id"`);
        await queryRunner.query(`ALTER TABLE "lab_tests" ADD "code" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lab_tests" DROP COLUMN "code"`);
        await queryRunner.query(`ALTER TABLE "lab_groups" ADD "hmo_scheme_id" integer`);
        await queryRunner.query(`ALTER TABLE "lab_tests" ADD "hmoPrice" character varying`);
        await queryRunner.query(`ALTER TABLE "lab_tests" ADD "description" character varying`);
        await queryRunner.query(`ALTER TABLE "lab_tests" ADD "slug" character varying`);
        await queryRunner.query(`ALTER TABLE "lab_tests" ADD "test_type" character varying`);
        await queryRunner.query(`ALTER TABLE "lab_tests" ADD "price" character varying(300) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "lab_tests" ADD "hmo_scheme_id" integer`);
        await queryRunner.query(`ALTER TABLE "lab_groups" ADD CONSTRAINT "FK_57666c94216936030cbd02d1925" FOREIGN KEY ("hmo_scheme_id") REFERENCES "hmo_schemes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lab_tests" ADD CONSTRAINT "FK_f5a991c6c21925590fb61cacae4" FOREIGN KEY ("hmo_scheme_id") REFERENCES "hmo_schemes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
