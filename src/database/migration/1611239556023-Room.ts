import {MigrationInterface, QueryRunner} from "typeorm";

export class Room1611239556023 implements MigrationInterface {
    name = 'Room1611239556023'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "room_categories" DROP COLUMN "discount"`);
        await queryRunner.query(`ALTER TABLE "room_categories" ADD "hmoTarrif" character varying`);
        await queryRunner.query(`ALTER TABLE "room_categories" ADD "hmo_id" integer`);
        await queryRunner.query(`ALTER TABLE "room_categories" ADD CONSTRAINT "FK_22083552254590537a209d847cc" FOREIGN KEY ("hmo_id") REFERENCES "hmos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "room_categories" DROP CONSTRAINT "FK_22083552254590537a209d847cc"`);
        await queryRunner.query(`ALTER TABLE "room_categories" DROP COLUMN "hmo_id"`);
        await queryRunner.query(`ALTER TABLE "room_categories" DROP COLUMN "hmoTarrif"`);
        await queryRunner.query(`ALTER TABLE "room_categories" ADD "discount" character varying(300)`);
    }

}
