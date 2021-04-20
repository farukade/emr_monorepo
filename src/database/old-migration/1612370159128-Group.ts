import {MigrationInterface, QueryRunner} from "typeorm";

export class Group1612370159128 implements MigrationInterface {
    name = 'Group1612370159128'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lab_groups" RENAME COLUMN "lab_tests" TO "hmo_id"`);
        await queryRunner.query(`CREATE TABLE "lab_group_tests" ("id" SERIAL NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdBy" character varying(300), "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "group_id" integer, "lab_test_id" integer, CONSTRAINT "PK_1ed1c6f6ead94f0b4eff2f8521d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "lab_groups" DROP COLUMN "hmo_id"`);
        await queryRunner.query(`ALTER TABLE "lab_groups" ADD "hmo_id" integer`);
        await queryRunner.query(`ALTER TABLE "lab_groups" ADD CONSTRAINT "FK_6269dcadb9df5f8a7f382724bf5" FOREIGN KEY ("hmo_id") REFERENCES "hmos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lab_group_tests" ADD CONSTRAINT "FK_bdf441758b6dd9facea9f9296c2" FOREIGN KEY ("group_id") REFERENCES "lab_groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lab_group_tests" ADD CONSTRAINT "FK_7215378ec96f79234eee6aeabda" FOREIGN KEY ("lab_test_id") REFERENCES "lab_tests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lab_group_tests" DROP CONSTRAINT "FK_7215378ec96f79234eee6aeabda"`);
        await queryRunner.query(`ALTER TABLE "lab_group_tests" DROP CONSTRAINT "FK_bdf441758b6dd9facea9f9296c2"`);
        await queryRunner.query(`ALTER TABLE "lab_groups" DROP CONSTRAINT "FK_6269dcadb9df5f8a7f382724bf5"`);
        await queryRunner.query(`ALTER TABLE "lab_groups" DROP COLUMN "hmo_id"`);
        await queryRunner.query(`ALTER TABLE "lab_groups" ADD "hmo_id" jsonb`);
        await queryRunner.query(`DROP TABLE "lab_group_tests"`);
        await queryRunner.query(`ALTER TABLE "lab_groups" RENAME COLUMN "hmo_id" TO "lab_tests"`);
    }

}
