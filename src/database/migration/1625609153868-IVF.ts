import {MigrationInterface, QueryRunner} from "typeorm";

export class IVF1625609153868 implements MigrationInterface {
    name = 'IVF1625609153868'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ivf_hcg_administration_charts" ADD "isActive" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "ivf_hcg_administration_charts" ADD "createdBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "ivf_hcg_administration_charts" ADD "lastChangedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "ivf_hcg_administration_charts" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "ivf_hcg_administration_charts" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "ivf_hcg_administration_charts" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "ivf_hcg_administration_charts" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "ivf_hcg_administration_charts" ALTER COLUMN "timeOfEntry" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ivf_hcg_administration_charts" ALTER COLUMN "timeOfAdmin" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ivf_hcg_administration_charts" ALTER COLUMN "typeOfHcg" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ivf_hcg_administration_charts" ALTER COLUMN "typeOfDosage" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ivf_hcg_administration_charts" ALTER COLUMN "routeOfAdmin" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ivf_hcg_administration_charts" ALTER COLUMN "remarks" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ivf_hcg_administration_charts" ALTER COLUMN "remarks" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ivf_hcg_administration_charts" ALTER COLUMN "routeOfAdmin" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ivf_hcg_administration_charts" ALTER COLUMN "typeOfDosage" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ivf_hcg_administration_charts" ALTER COLUMN "typeOfHcg" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ivf_hcg_administration_charts" ALTER COLUMN "timeOfAdmin" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ivf_hcg_administration_charts" ALTER COLUMN "timeOfEntry" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ivf_hcg_administration_charts" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "ivf_hcg_administration_charts" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "ivf_hcg_administration_charts" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "ivf_hcg_administration_charts" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "ivf_hcg_administration_charts" DROP COLUMN "lastChangedBy"`);
        await queryRunner.query(`ALTER TABLE "ivf_hcg_administration_charts" DROP COLUMN "createdBy"`);
        await queryRunner.query(`ALTER TABLE "ivf_hcg_administration_charts" DROP COLUMN "isActive"`);
    }

}
