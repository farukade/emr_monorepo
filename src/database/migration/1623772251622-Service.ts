import {MigrationInterface, QueryRunner} from "typeorm";

export class Service1623772251622 implements MigrationInterface {
    name = 'Service1623772251622'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_histories" ALTER COLUMN "category" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "patient_histories" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "patient_histories" ADD "description" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_75f8e75a828cb64ea9016e52732"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_037e8a51b3dd187b96ce20f906a"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_c09d54644d40718fb05980f350f"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "REL_75f8e75a828cb64ea9016e5273"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "REL_037e8a51b3dd187b96ce20f906"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "REL_c09d54644d40718fb05980f350"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_fe0bb3f6520ee0469504521e71" ON "users" ("username") `);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_75f8e75a828cb64ea9016e52732" FOREIGN KEY ("patient_request_item_id") REFERENCES "patient_request_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_037e8a51b3dd187b96ce20f906a" FOREIGN KEY ("patient_request_id") REFERENCES "patient_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_c09d54644d40718fb05980f350f" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_c09d54644d40718fb05980f350f"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_037e8a51b3dd187b96ce20f906a"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_75f8e75a828cb64ea9016e52732"`);
        await queryRunner.query(`DROP INDEX "IDX_fe0bb3f6520ee0469504521e71"`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "REL_c09d54644d40718fb05980f350" UNIQUE ("appointment_id")`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "REL_037e8a51b3dd187b96ce20f906" UNIQUE ("patient_request_id")`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "REL_75f8e75a828cb64ea9016e5273" UNIQUE ("patient_request_item_id")`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_c09d54644d40718fb05980f350f" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_037e8a51b3dd187b96ce20f906a" FOREIGN KEY ("patient_request_id") REFERENCES "patient_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_75f8e75a828cb64ea9016e52732" FOREIGN KEY ("patient_request_item_id") REFERENCES "patient_request_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_histories" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "patient_histories" ADD "description" jsonb`);
        await queryRunner.query(`ALTER TABLE "patient_histories" ALTER COLUMN "category" SET NOT NULL`);
    }

}
