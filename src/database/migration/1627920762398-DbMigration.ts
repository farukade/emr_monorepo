import {MigrationInterface, QueryRunner} from "typeorm";

export class DbMigration1627920762398 implements MigrationInterface {
    name = 'DbMigration1627920762398'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "staff_details" ADD "profession" character varying(300)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "staff_details" DROP COLUMN "profession"`);
    }

}
