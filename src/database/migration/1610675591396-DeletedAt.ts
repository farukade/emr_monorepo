import {MigrationInterface, QueryRunner} from "typeorm";

export class DeletedAt1610675591396 implements MigrationInterface {
    name = 'DeletedAt1610675591396'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_next_of_kins" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "consulting_rooms" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "service_categories" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "service_sub_categories" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "hmos" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "services" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "room_categories" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "rooms" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "departments" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "permissions" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "roles" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "specializations" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "staff_details" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "admissions" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "patient_vitals" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "admission_clinical_tasks" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "patient_requests" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "encounters" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "nicu" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "patients" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "vouchers" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "inventory_categories" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "inventory_sub_categories" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "vendors" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "stocks" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "hmo_rates" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "performance_appraisal_periods" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "performance_indicators" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "performance_appraisals" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "performance_comments" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "performance_indicator_reports" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "supervisor_evalutions" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "supervisor_evaluation_reports" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "roasters" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "leave_categories" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "diagnosis" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "leave_applications" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "salary_allowances" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "salary_deductions" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "salary_payment_deductions" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "salary_payments" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "salary_payment_allowances" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "cafeteria_inventory_categories" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "cafeteria_inventories" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "cafeteria_item_categories" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "cafeteria_items" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "antenatal_visits" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "patient_allergies" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "patient_antenatals" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "patient_documents" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "patient_request_documents" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "ivf_enrollments" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "ivf_down_regulation_charts" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "labour_enrollments" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "labour_delivery_records" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "labour_risk_assessments" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "labour_vitals" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "lab_groups" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "lab_test_categories" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "lab_tests" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "lab_parameters" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "request_types" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "lab_specimens" ADD "deleted_at" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lab_specimens" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "request_types" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "lab_parameters" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "lab_tests" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "lab_test_categories" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "lab_groups" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "labour_vitals" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "labour_risk_assessments" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "labour_delivery_records" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "labour_enrollments" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "ivf_down_regulation_charts" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "ivf_enrollments" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "patient_request_documents" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "patient_documents" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "patient_antenatals" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "patient_allergies" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "antenatal_visits" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "cafeteria_items" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "cafeteria_item_categories" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "cafeteria_inventories" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "cafeteria_inventory_categories" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "salary_payment_allowances" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "salary_payments" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "salary_payment_deductions" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "salary_deductions" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "salary_allowances" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "leave_applications" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "diagnosis" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "leave_categories" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "roasters" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "supervisor_evaluation_reports" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "supervisor_evalutions" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "performance_indicator_reports" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "performance_comments" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "performance_appraisals" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "performance_indicators" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "performance_appraisal_periods" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "hmo_rates" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "stocks" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "vendors" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "inventory_sub_categories" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "inventory_categories" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "vouchers" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "nicu" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "encounters" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "patient_requests" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "admission_clinical_tasks" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "patient_vitals" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "staff_details" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "specializations" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "permissions" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "departments" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "rooms" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "room_categories" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "hmos" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "service_sub_categories" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "service_categories" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "consulting_rooms" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "patient_next_of_kins" DROP COLUMN "deleted_at"`);
    }

}
