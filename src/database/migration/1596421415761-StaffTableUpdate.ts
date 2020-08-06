import {MigrationInterface, QueryRunner} from "typeorm";

export class StaffTableUpdate1596421415761 implements MigrationInterface {
    name = 'StaffTableUpdate1596421415761'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "roles_permissions" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updateAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdBy" character varying(300), "lastChangedBy" character varying(300), "role_id" uuid, "permission_id" uuid, CONSTRAINT "PK_298f2c0e2ea45289aa0c4ac8a02" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "staff_details" ADD "specialization_id" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "staff_details" ADD CONSTRAINT "FK_07521dffc5758ed1a41625a34a1" FOREIGN KEY ("specialization_id") REFERENCES "specializations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "roles_permissions" ADD CONSTRAINT "FK_7d2dad9f14eddeb09c256fea719" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "roles_permissions" ADD CONSTRAINT "FK_337aa8dba227a1fe6b73998307b" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "roles_permissions" DROP CONSTRAINT "FK_337aa8dba227a1fe6b73998307b"`, undefined);
        await queryRunner.query(`ALTER TABLE "roles_permissions" DROP CONSTRAINT "FK_7d2dad9f14eddeb09c256fea719"`, undefined);
        await queryRunner.query(`ALTER TABLE "staff_details" DROP CONSTRAINT "FK_07521dffc5758ed1a41625a34a1"`, undefined);
        await queryRunner.query(`ALTER TABLE "staff_details" DROP COLUMN "specialization_id"`, undefined);
        await queryRunner.query(`DROP TABLE "roles_permissions"`, undefined);
    }

}
