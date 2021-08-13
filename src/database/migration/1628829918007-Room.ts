import {MigrationInterface, QueryRunner} from "typeorm";

export class Room1628829918007 implements MigrationInterface {
    name = 'Room1628829918007'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rooms" ADD "admission_id" integer`);
        await queryRunner.query(`ALTER TABLE "rooms" ADD CONSTRAINT "FK_857bea5dd5f2eb9d6c8bdc863df" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rooms" DROP CONSTRAINT "FK_857bea5dd5f2eb9d6c8bdc863df"`);
        await queryRunner.query(`ALTER TABLE "rooms" DROP COLUMN "admission_id"`);
    }

}
