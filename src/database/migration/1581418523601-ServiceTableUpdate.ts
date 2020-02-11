import {MigrationInterface, QueryRunner} from "typeorm";

export class ServiceTableUpdate1581418523601 implements MigrationInterface {
    name = 'ServiceTableUpdate1581418523601'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "service_sub_categories" DROP CONSTRAINT "UQ_02b89162fa0c78085074014b03d"`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "service_sub_categories" ADD CONSTRAINT "UQ_02b89162fa0c78085074014b03d" UNIQUE ("name")`, undefined);
    }

}
