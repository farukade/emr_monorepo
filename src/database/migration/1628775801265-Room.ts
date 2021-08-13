import {MigrationInterface, QueryRunner} from "typeorm";

export class Room1628775801265 implements MigrationInterface {
    name = 'Room1628775801265'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "room_categories" DROP CONSTRAINT "FK_c92cbfe09278d77a8bdbc1e08fc"`);
        await queryRunner.query(`ALTER TABLE "room_categories" DROP COLUMN "hmo_scheme_id"`);
        await queryRunner.query(`ALTER TABLE "room_categories" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "room_categories" DROP COLUMN "hmoTarrif"`);
        await queryRunner.query(`ALTER TABLE "room_categories" ADD "code" character varying(300)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "room_categories" DROP COLUMN "code"`);
        await queryRunner.query(`ALTER TABLE "room_categories" ADD "hmoTarrif" character varying`);
        await queryRunner.query(`ALTER TABLE "room_categories" ADD "price" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "room_categories" ADD "hmo_scheme_id" integer`);
        await queryRunner.query(`ALTER TABLE "room_categories" ADD CONSTRAINT "FK_c92cbfe09278d77a8bdbc1e08fc" FOREIGN KEY ("hmo_scheme_id") REFERENCES "hmo_schemes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
