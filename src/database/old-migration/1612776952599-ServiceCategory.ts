import {MigrationInterface, QueryRunner} from "typeorm";

export class ServiceCategory1612776952599 implements MigrationInterface {
    name = 'ServiceCategory1612776952599'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service_categories" ADD "slug" character varying(300)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service_categories" DROP COLUMN "slug"`);
    }

}
