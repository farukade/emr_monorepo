import {MigrationInterface, QueryRunner} from "typeorm";

export class EmbryoUpdateTwo1658570226392 implements MigrationInterface {
    name = 'EmbryoUpdateTwo1658570226392'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cell_info" DROP CONSTRAINT "FK_c26e8529e697484dcce96a8889f"`);
        await queryRunner.query(`ALTER TABLE "cell_info" DROP CONSTRAINT "FK_ef5844128abaf87eced568a3c6e"`);
        await queryRunner.query(`CREATE TABLE "biopsy" ("id" SERIAL NOT NULL, "old_id" character varying, "createdBy" character varying(300) NOT NULL DEFAULT 'admin', "lastChangedBy" character varying(300), "deleted_at" TIMESTAMP, "deletedBy" character varying(300), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "type" character varying, "one" character varying, "two" character varying, "three" character varying, "four" character varying, "five" character varying, "six" character varying, "seven" character varying, "eight" character varying, "nine" character varying, "ten" character varying, "eleven" character varying, "twelve" character varying, "assessment_id" integer, CONSTRAINT "PK_7404f0555c615ee4c74a21f4d74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "cell_info" DROP COLUMN "assessment_id"`);
        await queryRunner.query(`ALTER TABLE "cell_info" DROP COLUMN "ivf_sperm_prep_id"`);
        await queryRunner.query(`ALTER TABLE "cell_info" DROP COLUMN "one"`);
        await queryRunner.query(`ALTER TABLE "cell_info" DROP COLUMN "two"`);
        await queryRunner.query(`ALTER TABLE "cell_info" DROP COLUMN "three"`);
        await queryRunner.query(`ALTER TABLE "cell_info" DROP COLUMN "four"`);
        await queryRunner.query(`ALTER TABLE "cell_info" DROP COLUMN "five"`);
        await queryRunner.query(`ALTER TABLE "cell_info" DROP COLUMN "six"`);
        await queryRunner.query(`ALTER TABLE "cell_info" DROP COLUMN "seven"`);
        await queryRunner.query(`ALTER TABLE "cell_info" DROP COLUMN "eight"`);
        await queryRunner.query(`ALTER TABLE "cell_info" DROP COLUMN "nine"`);
        await queryRunner.query(`ALTER TABLE "cell_info" DROP COLUMN "ten"`);
        await queryRunner.query(`ALTER TABLE "cell_info" DROP COLUMN "eleven"`);
        await queryRunner.query(`ALTER TABLE "cell_info" DROP COLUMN "twelve"`);
        await queryRunner.query(`ALTER TABLE "ivf_sperm_preparation" DROP COLUMN "withdrawalMethod"`);
        await queryRunner.query(`ALTER TABLE "cell_info" ADD "sperm_prep_id" integer`);
        await queryRunner.query(`ALTER TABLE "biopsy" ADD CONSTRAINT "FK_e578cd7f6f69c5c245c8a4dcdf6" FOREIGN KEY ("assessment_id") REFERENCES "embryo_assessment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cell_info" ADD CONSTRAINT "FK_a48573b8204895595624e4ae55c" FOREIGN KEY ("sperm_prep_id") REFERENCES "ivf_sperm_preparation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cell_info" DROP CONSTRAINT "FK_a48573b8204895595624e4ae55c"`);
        await queryRunner.query(`ALTER TABLE "biopsy" DROP CONSTRAINT "FK_e578cd7f6f69c5c245c8a4dcdf6"`);
        await queryRunner.query(`ALTER TABLE "cell_info" DROP COLUMN "sperm_prep_id"`);
        await queryRunner.query(`ALTER TABLE "ivf_sperm_preparation" ADD "withdrawalMethod" character varying`);
        await queryRunner.query(`ALTER TABLE "cell_info" ADD "twelve" character varying`);
        await queryRunner.query(`ALTER TABLE "cell_info" ADD "eleven" character varying`);
        await queryRunner.query(`ALTER TABLE "cell_info" ADD "ten" character varying`);
        await queryRunner.query(`ALTER TABLE "cell_info" ADD "nine" character varying`);
        await queryRunner.query(`ALTER TABLE "cell_info" ADD "eight" character varying`);
        await queryRunner.query(`ALTER TABLE "cell_info" ADD "seven" character varying`);
        await queryRunner.query(`ALTER TABLE "cell_info" ADD "six" character varying`);
        await queryRunner.query(`ALTER TABLE "cell_info" ADD "five" character varying`);
        await queryRunner.query(`ALTER TABLE "cell_info" ADD "four" character varying`);
        await queryRunner.query(`ALTER TABLE "cell_info" ADD "three" character varying`);
        await queryRunner.query(`ALTER TABLE "cell_info" ADD "two" character varying`);
        await queryRunner.query(`ALTER TABLE "cell_info" ADD "one" character varying`);
        await queryRunner.query(`ALTER TABLE "cell_info" ADD "ivf_sperm_prep_id" integer`);
        await queryRunner.query(`ALTER TABLE "cell_info" ADD "assessment_id" integer`);
        await queryRunner.query(`DROP TABLE "biopsy"`);
        await queryRunner.query(`ALTER TABLE "cell_info" ADD CONSTRAINT "FK_ef5844128abaf87eced568a3c6e" FOREIGN KEY ("ivf_sperm_prep_id") REFERENCES "ivf_sperm_preparation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cell_info" ADD CONSTRAINT "FK_c26e8529e697484dcce96a8889f" FOREIGN KEY ("assessment_id") REFERENCES "embryo_assessment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
