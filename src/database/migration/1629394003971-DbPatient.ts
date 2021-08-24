import {MigrationInterface, QueryRunner} from "typeorm";

export class DbPatient1629394003971 implements MigrationInterface {
    name = 'DbPatient1629394003971'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patients" DROP CONSTRAINT "FK_76612193361e0b179d8530a2d4e"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP CONSTRAINT "REL_76612193361e0b179d8530a2d4"`);
        await queryRunner.query(`ALTER TABLE "patients" ADD CONSTRAINT "FK_76612193361e0b179d8530a2d4e" FOREIGN KEY ("staff_id") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patients" DROP CONSTRAINT "FK_76612193361e0b179d8530a2d4e"`);
        await queryRunner.query(`ALTER TABLE "patients" ADD CONSTRAINT "REL_76612193361e0b179d8530a2d4" UNIQUE ("staff_id")`);
        await queryRunner.query(`ALTER TABLE "patients" ADD CONSTRAINT "FK_76612193361e0b179d8530a2d4e" FOREIGN KEY ("staff_id") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
