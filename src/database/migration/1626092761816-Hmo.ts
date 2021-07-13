import {MigrationInterface, QueryRunner} from "typeorm";

export class Hmo1626092761816 implements MigrationInterface {
    name = 'Hmo1626092761816'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "hmos" ALTER COLUMN "phoneNumber" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "hmos" ALTER COLUMN "email" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "hmos" ALTER COLUMN "email" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "hmos" ALTER COLUMN "phoneNumber" DROP NOT NULL`);
    }

}
