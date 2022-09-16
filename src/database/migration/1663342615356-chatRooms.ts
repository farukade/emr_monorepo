import {MigrationInterface, QueryRunner} from "typeorm";

export class chatRooms1663342615356 implements MigrationInterface {
    name = 'chatRooms1663342615356'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat_rooms" ADD CONSTRAINT "UQ_da0a82e8162f899dabdca236888" UNIQUE ("name")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat_rooms" DROP CONSTRAINT "UQ_da0a82e8162f899dabdca236888"`);
    }

}
