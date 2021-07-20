import {MigrationInterface, QueryRunner} from "typeorm";

export class DbMigration1626714317945 implements MigrationInterface {
    name = 'DbMigration1626714317945'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service_costs" ADD "code" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service_costs" DROP COLUMN "code"`);
    }

}
