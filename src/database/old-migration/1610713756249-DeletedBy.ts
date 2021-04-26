import {MigrationInterface, QueryRunner} from "typeorm";

export class DeletedBy1610713756249 implements MigrationInterface {
    name = 'DeletedBy1610713756249'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_next_of_kins" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "consulting_rooms" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "service_categories" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "service_sub_categories" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "hmos" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "services" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "room_categories" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "rooms" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "departments" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "permissions" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "roles" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "specializations" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "immunizations" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "staff_details" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "admissions" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "patient_vitals" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "admission_clinical_tasks" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "patient_requests" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "encounters" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "nicu" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "patients" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "vouchers" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "inventory_categories" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "inventory_sub_categories" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "vendors" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "stocks" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "hmo_rates" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "performance_appraisal_periods" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "performance_indicators" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "performance_appraisals" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "performance_comments" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "performance_indicator_reports" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "supervisor_evalutions" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "supervisor_evaluation_reports" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "roasters" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "leave_categories" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "diagnosis" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "leave_applications" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "salary_allowances" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "salary_deductions" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "salary_payment_deductions" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "salary_payments" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "salary_payment_allowances" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "cafeteria_inventory_categories" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "cafeteria_inventories" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "cafeteria_item_categories" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "cafeteria_items" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "antenatal_visits" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "patient_allergens" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "patient_antenatals" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "patient_documents" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "ivf_enrollments" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "ivf_down_regulation_charts" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "labour_delivery_records" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "labour_risk_assessments" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "labour_vitals" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "lab_groups" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "lab_test_categories" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "lab_tests" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "lab_parameters" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "request_types" ADD "deletedBy" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "lab_specimens" ADD "deletedBy" character varying(300)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lab_specimens" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "request_types" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "lab_parameters" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "lab_tests" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "lab_test_categories" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "lab_groups" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "labour_vitals" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "labour_risk_assessments" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "labour_delivery_records" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "ivf_down_regulation_charts" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "ivf_enrollments" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "patient_documents" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "patient_antenatals" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "patient_allergens" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "antenatal_visits" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "cafeteria_items" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "cafeteria_item_categories" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "cafeteria_inventories" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "cafeteria_inventory_categories" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "salary_payment_allowances" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "salary_payments" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "salary_payment_deductions" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "salary_deductions" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "salary_allowances" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "leave_applications" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "diagnosis" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "leave_categories" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "roasters" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "supervisor_evaluation_reports" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "supervisor_evalutions" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "performance_indicator_reports" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "performance_comments" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "performance_appraisals" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "performance_indicators" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "performance_appraisal_periods" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "hmo_rates" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "stocks" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "vendors" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "inventory_sub_categories" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "inventory_categories" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "vouchers" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "nicu" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "encounters" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "patient_requests" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "admission_clinical_tasks" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "patient_vitals" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "admissions" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "staff_details" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "immunizations" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "specializations" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "permissions" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "departments" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "rooms" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "room_categories" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "hmos" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "service_sub_categories" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "service_categories" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "consulting_rooms" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "patient_next_of_kins" DROP COLUMN "deletedBy"`);
    }

}