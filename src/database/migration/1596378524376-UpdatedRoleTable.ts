import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdatedRoleTable1596378524376 implements MigrationInterface {
    name = 'UpdatedRoleTable1596378524376'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "admission_care_givers" ("id" SERIAL NOT NULL, "admissionId" uuid, "staffId" uuid, CONSTRAINT "PK_f42bf75761de230f4cc5f001956" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "roles_permissions_permissions" ("rolesId" uuid NOT NULL, "permissionsId" uuid NOT NULL, CONSTRAINT "PK_b2f4e3f7fbeb7e5b495dd819842" PRIMARY KEY ("rolesId", "permissionsId"))`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_dc2b9d46195bb3ed28abbf7c9e" ON "roles_permissions_permissions" ("rolesId") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_fd4d5d4c7f7ff16c57549b72c6" ON "roles_permissions_permissions" ("permissionsId") `, undefined);
        await queryRunner.query(`ALTER TABLE "banks" ADD CONSTRAINT "PK_3975b5f684ec241e3901db62d77" PRIMARY KEY ("id")`, undefined);
        await queryRunner.query(`ALTER TABLE "cafeteria_inventory_categories" ADD CONSTRAINT "PK_2acf4890cae534ba1644ea95d81" PRIMARY KEY ("id")`, undefined);
        await queryRunner.query(`ALTER TABLE "cafeteria_inventory_categories" ADD CONSTRAINT "UQ_854762618165587d8ef64fdc346" UNIQUE ("name")`, undefined);
        await queryRunner.query(`ALTER TABLE "cafeteria_inventories" ADD CONSTRAINT "PK_f4dc057ccb5defa200880d18c9a" PRIMARY KEY ("id")`, undefined);
        await queryRunner.query(`ALTER TABLE "admission_clinical_tasks" ADD CONSTRAINT "PK_0f4e39d62c498244852e2ecad02" PRIMARY KEY ("id")`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" ADD CONSTRAINT "PK_6d47682a899dfa0a78ce11fe98a" PRIMARY KEY ("id")`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ADD CONSTRAINT "PK_d098a3a1d55a514717b49310f4a" PRIMARY KEY ("id")`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_visits" ADD CONSTRAINT "PK_82b01d2796241d80648b7fe3d42" PRIMARY KEY ("id")`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_visits" ADD CONSTRAINT "UQ_a6370a05e34da25aa153f897ac0" UNIQUE ("lab_request")`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_visits" ADD CONSTRAINT "UQ_da11407529f14d3d485882182d3" UNIQUE ("radiology_request")`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_visits" ADD CONSTRAINT "UQ_c203386678db07754037b489c88" UNIQUE ("pharmacy_request")`, undefined);
        await queryRunner.query(`ALTER TABLE "cafeteria_inventories" ADD CONSTRAINT "FK_4160294afacf5c511b08ab968b6" FOREIGN KEY ("categoryId") REFERENCES "cafeteria_inventory_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "admission_clinical_tasks" ADD CONSTRAINT "FK_ecedff847d155018bde71f9fb2c" FOREIGN KEY ("admissionId") REFERENCES "admissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" ADD CONSTRAINT "FK_f9d5de8d7dd020123a3c76f0a2e" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" ADD CONSTRAINT "FK_e892e10c6d41e330d59943e2659" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" ADD CONSTRAINT "FK_116636d085c212a2aa57281b806" FOREIGN KEY ("pcg") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "admission_care_givers" ADD CONSTRAINT "FK_4e947e134cbd9b50b7a64f2aef3" FOREIGN KEY ("admissionId") REFERENCES "admissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "admission_care_givers" ADD CONSTRAINT "FK_abeca5cb96a6f600a76387c4fde" FOREIGN KEY ("staffId") REFERENCES "staff_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ADD CONSTRAINT "FK_4fb49f23f98143d3a799c9f634d" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_visits" ADD CONSTRAINT "FK_83e30cd3e71c97df575d9516f29" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_visits" ADD CONSTRAINT "FK_a6370a05e34da25aa153f897ac0" FOREIGN KEY ("lab_request") REFERENCES "patient_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_visits" ADD CONSTRAINT "FK_da11407529f14d3d485882182d3" FOREIGN KEY ("radiology_request") REFERENCES "patient_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_visits" ADD CONSTRAINT "FK_c203386678db07754037b489c88" FOREIGN KEY ("pharmacy_request") REFERENCES "patient_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "roles_permissions_permissions" ADD CONSTRAINT "FK_dc2b9d46195bb3ed28abbf7c9e3" FOREIGN KEY ("rolesId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "roles_permissions_permissions" ADD CONSTRAINT "FK_fd4d5d4c7f7ff16c57549b72c6f" FOREIGN KEY ("permissionsId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "roles_permissions_permissions" DROP CONSTRAINT "FK_fd4d5d4c7f7ff16c57549b72c6f"`, undefined);
        await queryRunner.query(`ALTER TABLE "roles_permissions_permissions" DROP CONSTRAINT "FK_dc2b9d46195bb3ed28abbf7c9e3"`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_visits" DROP CONSTRAINT "FK_c203386678db07754037b489c88"`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_visits" DROP CONSTRAINT "FK_da11407529f14d3d485882182d3"`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_visits" DROP CONSTRAINT "FK_a6370a05e34da25aa153f897ac0"`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_visits" DROP CONSTRAINT "FK_83e30cd3e71c97df575d9516f29"`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" DROP CONSTRAINT "FK_4fb49f23f98143d3a799c9f634d"`, undefined);
        await queryRunner.query(`ALTER TABLE "admission_care_givers" DROP CONSTRAINT "FK_abeca5cb96a6f600a76387c4fde"`, undefined);
        await queryRunner.query(`ALTER TABLE "admission_care_givers" DROP CONSTRAINT "FK_4e947e134cbd9b50b7a64f2aef3"`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" DROP CONSTRAINT "FK_116636d085c212a2aa57281b806"`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" DROP CONSTRAINT "FK_e892e10c6d41e330d59943e2659"`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" DROP CONSTRAINT "FK_f9d5de8d7dd020123a3c76f0a2e"`, undefined);
        await queryRunner.query(`ALTER TABLE "admission_clinical_tasks" DROP CONSTRAINT "FK_ecedff847d155018bde71f9fb2c"`, undefined);
        await queryRunner.query(`ALTER TABLE "cafeteria_inventories" DROP CONSTRAINT "FK_4160294afacf5c511b08ab968b6"`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_visits" DROP CONSTRAINT "UQ_c203386678db07754037b489c88"`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_visits" DROP CONSTRAINT "UQ_da11407529f14d3d485882182d3"`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_visits" DROP CONSTRAINT "UQ_a6370a05e34da25aa153f897ac0"`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_visits" DROP CONSTRAINT "PK_82b01d2796241d80648b7fe3d42"`, undefined);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" DROP CONSTRAINT "PK_d098a3a1d55a514717b49310f4a"`, undefined);
        await queryRunner.query(`ALTER TABLE "admissions" DROP CONSTRAINT "PK_6d47682a899dfa0a78ce11fe98a"`, undefined);
        await queryRunner.query(`ALTER TABLE "admission_clinical_tasks" DROP CONSTRAINT "PK_0f4e39d62c498244852e2ecad02"`, undefined);
        await queryRunner.query(`ALTER TABLE "cafeteria_inventories" DROP CONSTRAINT "PK_f4dc057ccb5defa200880d18c9a"`, undefined);
        await queryRunner.query(`ALTER TABLE "cafeteria_inventory_categories" DROP CONSTRAINT "UQ_854762618165587d8ef64fdc346"`, undefined);
        await queryRunner.query(`ALTER TABLE "cafeteria_inventory_categories" DROP CONSTRAINT "PK_2acf4890cae534ba1644ea95d81"`, undefined);
        await queryRunner.query(`ALTER TABLE "banks" DROP CONSTRAINT "PK_3975b5f684ec241e3901db62d77"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_fd4d5d4c7f7ff16c57549b72c6"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_dc2b9d46195bb3ed28abbf7c9e"`, undefined);
        await queryRunner.query(`DROP TABLE "roles_permissions_permissions"`, undefined);
        await queryRunner.query(`DROP TABLE "admission_care_givers"`, undefined);
    }

}
