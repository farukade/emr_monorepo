import {MigrationInterface, QueryRunner} from "typeorm";

export class ServiceTableUpdate21581421251744 implements MigrationInterface {
    name = 'ServiceTableUpdate21581421251744'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "services" ADD "code" character varying(20) NOT NULL DEFAULT 0`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "code"`, undefined);
    }

}
