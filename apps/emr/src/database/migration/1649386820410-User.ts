import {MigrationInterface, QueryRunner} from "typeorm";

export class User1649386820410 implements MigrationInterface {
    name = 'User1649386820410'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "activities" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "permissions" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "departments" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "patient_next_of_kins" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "consulting_rooms" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "service_categories" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "room_categories" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "rooms" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "admissions" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "patient_fluid_charts" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "patient_vitals" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "nicu-accommodations" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "nicu" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "antenatal_packages" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "labour_enrollments" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "clinical_tasks" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "lab_test_categories" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "lab_tests" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "patient_documents" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "immunizations" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "drug_categories" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "drug_generics" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "drug_manufacturers" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "vendors" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "drug_batches" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "drugs" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "hmo_companies" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "hmo_types" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "hmo_schemes" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "service_costs" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "ivf_enrollments" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "patient_excuse_duties" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "patient_notes" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "patient_requests" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "store_inventories" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "patient_consumables" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "encounters" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "antenatal_assessments" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "patients" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "vouchers" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "specializations" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "staff_details" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "cafeteria_food_items" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "cafeteria_items" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "account_deposits" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "performance_appraisal_periods" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "performance_indicators" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "performance_appraisals" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "performance_comments" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "performance_indicator_reports" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "supervisor_evalutions" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "supervisor_evaluation_reports" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "duty_rosters" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "leave_categories" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "diagnosis" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "leave_applications" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "salary_allowances" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "salary_deductions" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "salary_payment_deductions" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "salary_payments" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "salary_payment_allowances" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "cafeteria_inventories" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "inventory_activities" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "inventory_purchases" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "requisitions" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "service_logs" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "admission_rooms" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "patient_care_teams" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "patient_alerts" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "patient_antenatals" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "ivf_down_regulation_charts" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "ivf_hcg_administration_charts" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "labour_delivery_records" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "labour_risk_assessments" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "labour_vitals" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "lab_groups" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "lab_group_tests" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "lab_parameters" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "payment_methods" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "request_types" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "settings" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "lab_specimens" ALTER COLUMN "createdBy" SET DEFAULT 'admin'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lab_specimens" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "settings" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "request_types" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "payment_methods" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "lab_parameters" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "lab_group_tests" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "lab_groups" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "labour_vitals" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "labour_risk_assessments" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "labour_measurements" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "labour_delivery_records" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "ivf_hcg_administration_charts" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "ivf_down_regulation_charts" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "patient_antenatals" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "patient_alerts" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "patient_care_teams" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "admission_rooms" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "service_logs" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "requisitions" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "inventory_purchases" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "inventory_activities" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "cafeteria_inventories" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "salary_payment_allowances" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "salary_payments" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "salary_payment_deductions" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "salary_deductions" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "salary_allowances" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "leave_applications" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "diagnosis" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "leave_categories" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "duty_rosters" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "supervisor_evaluation_reports" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "supervisor_evalutions" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "performance_indicator_reports" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "performance_comments" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "performance_appraisals" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "performance_indicators" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "performance_appraisal_periods" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "account_deposits" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "cafeteria_items" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "cafeteria_food_items" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "staff_details" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "specializations" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "vouchers" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "patients" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "antenatal_assessments" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "encounters" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "patient_consumables" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "store_inventories" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "patient_requests" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "patient_request_items" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "patient_notes" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "patient_excuse_duties" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "ivf_enrollments" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "service_costs" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "hmo_schemes" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "hmo_types" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "hmo_companies" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "drugs" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "drug_batches" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "vendors" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "drug_manufacturers" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "drug_generics" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "drug_categories" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "immunizations" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "patient_documents" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "lab_tests" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "lab_test_categories" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "clinical_tasks" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "labour_enrollments" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "antenatal_enrollments" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "antenatal_packages" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "nicu" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "nicu-accommodations" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "patient_vitals" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "patient_fluid_charts" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "admissions" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "rooms" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "room_categories" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "service_categories" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "consulting_rooms" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "patient_next_of_kins" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "departments" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "permissions" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
        await queryRunner.query(`ALTER TABLE "activities" ALTER COLUMN "createdBy" SET DEFAULT 'it-admin'`);
    }

}
