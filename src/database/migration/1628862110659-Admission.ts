import {MigrationInterface, QueryRunner} from "typeorm";

export class Admission1628862110659 implements MigrationInterface {
    name = 'Admission1628862110659'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rooms" DROP CONSTRAINT "FK_857bea5dd5f2eb9d6c8bdc863df"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rooms" ADD CONSTRAINT "FK_857bea5dd5f2eb9d6c8bdc863df" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
