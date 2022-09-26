import {MigrationInterface, QueryRunner} from "typeorm";

export class BioDeviceUsers1664199430044 implements MigrationInterface {
    name = 'BioDeviceUsers1664199430044'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attendance" DROP CONSTRAINT "FK_0bedbcc8d5f9b9ec4979f519597"`);
        await queryRunner.query(`CREATE TABLE "bio_device_user" ("id" integer NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying, "other_names" character varying, "staff_id" integer, "department_id" integer, "device_id" integer, CONSTRAINT "UQ_1f475e46abe392e48336b4f1173" UNIQUE ("id"), CONSTRAINT "PK_1f475e46abe392e48336b4f1173" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "bio_device_user" ADD CONSTRAINT "FK_eed83dd31b54e2cffd554fe95f2" FOREIGN KEY ("staff_id") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bio_device_user" ADD CONSTRAINT "FK_4d1a5216699bb6f56332b557e4d" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bio_device_user" ADD CONSTRAINT "FK_888fab5e44956ee7496005673ba" FOREIGN KEY ("device_id") REFERENCES "attendance-device"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendance" ADD CONSTRAINT "FK_0bedbcc8d5f9b9ec4979f519597" FOREIGN KEY ("user_id") REFERENCES "bio_device_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attendance" DROP CONSTRAINT "FK_0bedbcc8d5f9b9ec4979f519597"`);
        await queryRunner.query(`ALTER TABLE "bio_device_user" DROP CONSTRAINT "FK_888fab5e44956ee7496005673ba"`);
        await queryRunner.query(`ALTER TABLE "bio_device_user" DROP CONSTRAINT "FK_4d1a5216699bb6f56332b557e4d"`);
        await queryRunner.query(`ALTER TABLE "bio_device_user" DROP CONSTRAINT "FK_eed83dd31b54e2cffd554fe95f2"`);
        await queryRunner.query(`DROP TABLE "bio_device_user"`);
        await queryRunner.query(`ALTER TABLE "attendance" ADD CONSTRAINT "FK_0bedbcc8d5f9b9ec4979f519597" FOREIGN KEY ("user_id") REFERENCES "bio_device_User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
