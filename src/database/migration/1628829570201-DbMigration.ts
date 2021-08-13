import {MigrationInterface, QueryRunner} from "typeorm";

export class DbMigration1628829570201 implements MigrationInterface {
    name = 'DbMigration1628829570201'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rooms" ALTER COLUMN "status" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "rooms" ALTER COLUMN "status" SET DEFAULT 'Not Occupied'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rooms" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "rooms" ALTER COLUMN "status" DROP NOT NULL`);
    }

}
