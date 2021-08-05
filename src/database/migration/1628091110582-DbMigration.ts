import {MigrationInterface, QueryRunner} from "typeorm";

export class DbMigration1628091110582 implements MigrationInterface {
    name = 'DbMigration1628091110582'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_antenatals" DROP CONSTRAINT "FK_03586924a79d943987663167a5b"`);
        await queryRunner.query(`ALTER TABLE "patient_antenatals" RENAME COLUMN "patientId" TO "patient_id"`);
        await queryRunner.query(`ALTER TABLE "patient_notes" DROP COLUMN "item_id"`);
        await queryRunner.query(`ALTER TABLE "patient_notes" ADD "diagnosis" jsonb`);
        await queryRunner.query(`ALTER TABLE "patient_notes" ADD "diagnosis_type" character varying`);
        await queryRunner.query(`ALTER TABLE "patient_notes" ADD "comment" character varying`);
        await queryRunner.query(`ALTER TABLE "patient_notes" ADD "status" character varying NOT NULL DEFAULT 'Active'`);
        await queryRunner.query(`ALTER TABLE "patient_notes" ADD "allergy" character varying`);
        await queryRunner.query(`ALTER TABLE "patient_notes" ADD "severity" character varying`);
        await queryRunner.query(`ALTER TABLE "patient_notes" ADD "reaction" character varying`);
        await queryRunner.query(`ALTER TABLE "patient_notes" ADD "request_item_id" integer`);
        await queryRunner.query(`ALTER TABLE "patient_notes" ADD "drug_generic_id" integer`);
        await queryRunner.query(`ALTER TABLE "patient_notes" ALTER COLUMN "description" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "patient_notes" DROP COLUMN "category"`);
        await queryRunner.query(`ALTER TABLE "patient_notes" ADD "category" text`);
        await queryRunner.query(`ALTER TABLE "patient_notes" ALTER COLUMN "type" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "patient_notes" ADD CONSTRAINT "FK_4d07fbee4d22a141a1013371624" FOREIGN KEY ("request_item_id") REFERENCES "patient_request_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_notes" ADD CONSTRAINT "FK_045a91fd287ad9fc935bf97485b" FOREIGN KEY ("drug_generic_id") REFERENCES "drug_generics"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_antenatals" ADD CONSTRAINT "FK_7e2cb8caeac80bae27b36fe03f7" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_antenatals" DROP CONSTRAINT "FK_7e2cb8caeac80bae27b36fe03f7"`);
        await queryRunner.query(`ALTER TABLE "patient_notes" DROP CONSTRAINT "FK_045a91fd287ad9fc935bf97485b"`);
        await queryRunner.query(`ALTER TABLE "patient_notes" DROP CONSTRAINT "FK_4d07fbee4d22a141a1013371624"`);
        await queryRunner.query(`ALTER TABLE "patient_notes" ALTER COLUMN "type" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "patient_notes" DROP COLUMN "category"`);
        await queryRunner.query(`ALTER TABLE "patient_notes" ADD "category" character varying`);
        await queryRunner.query(`ALTER TABLE "patient_notes" ALTER COLUMN "description" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "patient_notes" DROP COLUMN "drug_generic_id"`);
        await queryRunner.query(`ALTER TABLE "patient_notes" DROP COLUMN "request_item_id"`);
        await queryRunner.query(`ALTER TABLE "patient_notes" DROP COLUMN "reaction"`);
        await queryRunner.query(`ALTER TABLE "patient_notes" DROP COLUMN "severity"`);
        await queryRunner.query(`ALTER TABLE "patient_notes" DROP COLUMN "allergy"`);
        await queryRunner.query(`ALTER TABLE "patient_notes" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "patient_notes" DROP COLUMN "comment"`);
        await queryRunner.query(`ALTER TABLE "patient_notes" DROP COLUMN "diagnosis_type"`);
        await queryRunner.query(`ALTER TABLE "patient_notes" DROP COLUMN "diagnosis"`);
        await queryRunner.query(`ALTER TABLE "patient_notes" ADD "item_id" character varying`);
        await queryRunner.query(`ALTER TABLE "patient_antenatals" RENAME COLUMN "patient_id" TO "patientId"`);
        await queryRunner.query(`ALTER TABLE "patient_antenatals" ADD CONSTRAINT "FK_03586924a79d943987663167a5b" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
