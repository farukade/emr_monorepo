import {MigrationInterface, QueryRunner} from "typeorm";

export class Immunization1601052696651 implements MigrationInterface {
    name = 'Immunization1601052696651'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "immunizations" ("id" SERIAL NOT NULL, "name_of_vaccine" character varying NOT NULL, "slug" character varying(30) NOT NULL, "description" character varying NOT NULL, "date_due" character varying NOT NULL, "period" character varying NOT NULL, "appointment_date" character varying, "date_administered" character varying, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "patient_id" uuid, "staff_id" uuid, "administeredBy" uuid, CONSTRAINT "PK_d6ef20ce9b42402adbbd1e260fe" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD CONSTRAINT "FK_3484afecca0b55b0ac4b5fdfc12" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD CONSTRAINT "FK_bb573ed65bc71c9a57c74247c07" FOREIGN KEY ("staff_id") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD CONSTRAINT "FK_61d7611a612fc2c4c86af509e35" FOREIGN KEY ("administeredBy") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "immunizations" DROP CONSTRAINT "FK_61d7611a612fc2c4c86af509e35"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP CONSTRAINT "FK_bb573ed65bc71c9a57c74247c07"`, undefined);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP CONSTRAINT "FK_3484afecca0b55b0ac4b5fdfc12"`, undefined);
        await queryRunner.query(`DROP TABLE "immunizations"`, undefined);
    }

}
