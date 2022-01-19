import {MigrationInterface, QueryRunner} from "typeorm";

export class RenameClinicalTask1642533852636 implements MigrationInterface {
    name = 'RenameClinicalTask1642533852636'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameTable('admission_clinical_tasks', 'clinical_tasks');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameTable('clinical_tasks', 'admission_clinical_tasks');
    }

}
