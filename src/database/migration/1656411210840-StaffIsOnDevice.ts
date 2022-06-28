import {MigrationInterface, QueryRunner} from "typeorm";

export class StaffIsOnDevice1656411210840 implements MigrationInterface {
    name = 'StaffIsOnDevice1656411210840'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "staff_details" ADD "isOnDevice" boolean DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "staff_details" DROP COLUMN "isOnDevice"`);
    }

}
