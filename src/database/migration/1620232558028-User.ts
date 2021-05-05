import {MigrationInterface, QueryRunner} from "typeorm";

export class User1620232558028 implements MigrationInterface {
    name = 'User1620232558028'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "staff_details" DROP CONSTRAINT "FK_aa8db8140822a874faacaca8ea7"`);
        await queryRunner.query(`ALTER TABLE "staff_details" ADD CONSTRAINT "FK_aa8db8140822a874faacaca8ea7" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "staff_details" DROP CONSTRAINT "FK_aa8db8140822a874faacaca8ea7"`);
        await queryRunner.query(`ALTER TABLE "staff_details" ADD CONSTRAINT "FK_aa8db8140822a874faacaca8ea7" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
