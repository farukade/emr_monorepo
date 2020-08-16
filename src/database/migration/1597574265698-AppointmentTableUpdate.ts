import {MigrationInterface, QueryRunner} from "typeorm";

export class AppointmentTableUpdate1597574265698 implements MigrationInterface {
    name = 'AppointmentTableUpdate1597574265698'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "next_location"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "next_location" character varying`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "next_location"`, undefined);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "next_location" character varying(20)`, undefined);
    }

}
