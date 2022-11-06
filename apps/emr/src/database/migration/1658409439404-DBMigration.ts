import {MigrationInterface, QueryRunner} from "typeorm";

export class DBMigration1658409439404 implements MigrationInterface {
    name = 'DBMigration1658409439404'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "permissions" DROP CONSTRAINT "FK_e4bd61cc68f39f6d12f38fd9564"`);
        await queryRunner.query(`ALTER TABLE "permissions" ADD CONSTRAINT "FK_e4bd61cc68f39f6d12f38fd9564" FOREIGN KEY ("category_id") REFERENCES "permission_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "permissions" DROP CONSTRAINT "FK_e4bd61cc68f39f6d12f38fd9564"`);
        await queryRunner.query(`ALTER TABLE "permissions" ADD CONSTRAINT "FK_e4bd61cc68f39f6d12f38fd9564" FOREIGN KEY ("category_id") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
