import {MigrationInterface, QueryRunner} from "typeorm";

export class ANCPackage1635776716075 implements MigrationInterface {
    name = 'ANCPackage1635776716075'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "antenatal_packages" ADD "coverage" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "antenatal_packages" DROP COLUMN "coverage"`);
    }

}
