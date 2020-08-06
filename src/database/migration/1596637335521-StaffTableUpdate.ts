import {MigrationInterface, QueryRunner} from "typeorm";

export class StaffTableUpdate1596637335521 implements MigrationInterface {
    name = 'StaffTableUpdate1596637335521'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "staff_details" ADD "consulting_room_id" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "staff_details" ADD CONSTRAINT "FK_e4fd80af4b8f2928ee543d17d8b" FOREIGN KEY ("consulting_room_id") REFERENCES "consulting_rooms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "staff_details" DROP CONSTRAINT "FK_e4fd80af4b8f2928ee543d17d8b"`, undefined);
        await queryRunner.query(`ALTER TABLE "staff_details" DROP COLUMN "consulting_room_id"`, undefined);
    }

}
