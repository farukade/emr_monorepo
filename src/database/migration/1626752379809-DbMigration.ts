import {MigrationInterface, QueryRunner} from "typeorm";

export class DbMigration1626752379809 implements MigrationInterface {
    name = 'DbMigration1626752379809'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_request_items" DROP CONSTRAINT "FK_a4fa7f03aee8fa57de0a2a4cb08"`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" ADD CONSTRAINT "UQ_a4fa7f03aee8fa57de0a2a4cb08" UNIQUE ("request_id")`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" ADD CONSTRAINT "FK_a4fa7f03aee8fa57de0a2a4cb08" FOREIGN KEY ("request_id") REFERENCES "patient_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_request_items" DROP CONSTRAINT "FK_a4fa7f03aee8fa57de0a2a4cb08"`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" DROP CONSTRAINT "UQ_a4fa7f03aee8fa57de0a2a4cb08"`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" ADD CONSTRAINT "FK_a4fa7f03aee8fa57de0a2a4cb08" FOREIGN KEY ("request_id") REFERENCES "patient_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
