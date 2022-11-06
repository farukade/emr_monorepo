import {MigrationInterface, QueryRunner} from "typeorm";

export class DropTables1661300662975 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("labour_vitals");
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
