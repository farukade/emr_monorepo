import {MigrationInterface, QueryRunner} from "typeorm";

export class BioDeviceUsers21664200948746 implements MigrationInterface {
    name = 'BioDeviceUsers21664200948746'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attendance" DROP CONSTRAINT "FK_0bedbcc8d5f9b9ec4979f519597"`);
        await queryRunner.query(`ALTER TABLE "bio_device_user" ADD CONSTRAINT "UQ_1f475e46abe392e48336b4f1173" UNIQUE ("id")`);
        await queryRunner.query(`ALTER TABLE "bio_device_user" ALTER COLUMN "first_name" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "attendance" ADD CONSTRAINT "FK_0bedbcc8d5f9b9ec4979f519597" FOREIGN KEY ("user_id") REFERENCES "bio_device_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attendance" DROP CONSTRAINT "FK_0bedbcc8d5f9b9ec4979f519597"`);
        await queryRunner.query(`ALTER TABLE "bio_device_user" ALTER COLUMN "first_name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bio_device_user" DROP CONSTRAINT "UQ_1f475e46abe392e48336b4f1173"`);
        await queryRunner.query(`ALTER TABLE "attendance" ADD CONSTRAINT "FK_0bedbcc8d5f9b9ec4979f519597" FOREIGN KEY ("user_id") REFERENCES "bio_device_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
