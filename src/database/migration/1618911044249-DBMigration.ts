import {MigrationInterface, QueryRunner} from "typeorm";

export class DBMigration1618911044249 implements MigrationInterface {
    name = 'DBMigration1618911044249'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "patient_review_of_systems" ("id" SERIAL NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdBy" character varying(300), "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "category" character varying NOT NULL, "description" jsonb, "patient_id" integer, "encounter_id" integer, "antenatal_id" integer, CONSTRAINT "PK_0fd48df97d51bf73a7f2eba6790" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "patient_review_of_systems" ADD CONSTRAINT "FK_e93f28ac0b04bebb999ec41be79" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_review_of_systems" ADD CONSTRAINT "FK_411b81b163b298bff642b15e46f" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_review_of_systems" ADD CONSTRAINT "FK_e41ea3cc3d521fad9114425ca48" FOREIGN KEY ("antenatal_id") REFERENCES "patient_antenatals"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_consumables" ADD "quantity" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_consumables" DROP COLUMN "quantity"`);
        await queryRunner.query(`ALTER TABLE "patient_review_of_systems" DROP CONSTRAINT "FK_e41ea3cc3d521fad9114425ca48"`);
        await queryRunner.query(`ALTER TABLE "patient_review_of_systems" DROP CONSTRAINT "FK_411b81b163b298bff642b15e46f"`);
        await queryRunner.query(`ALTER TABLE "patient_review_of_systems" DROP CONSTRAINT "FK_e93f28ac0b04bebb999ec41be79"`);
        await queryRunner.query(`DROP TABLE "patient_review_of_systems"`);
    }

}
