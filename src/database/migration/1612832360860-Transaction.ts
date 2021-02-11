import {MigrationInterface, QueryRunner} from "typeorm";

export class Transaction1612832360860 implements MigrationInterface {
    name = 'Transaction1612832360860'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_037e8a51b3dd187b96ce20f906a"`);
        await queryRunner.query(`ALTER TABLE "transactions" RENAME COLUMN "patient_request_id" TO "patient_request_item_id"`);
        await queryRunner.query(`ALTER TABLE "transactions" RENAME CONSTRAINT "REL_037e8a51b3dd187b96ce20f906" TO "UQ_75f8e75a828cb64ea9016e52732"`);
        await queryRunner.query(`COMMENT ON COLUMN "patient_next_of_kins"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "patient_next_of_kins"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "consulting_rooms"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "consulting_rooms"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "service_categories"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "service_categories"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "service_sub_categories"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "service_sub_categories"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "rooms"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "rooms"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "room_categories"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "room_categories"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "hmos"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "hmos"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "services"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "services"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "departments"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "departments"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "permissions"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "permissions"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "roles"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "roles"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "users"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "users"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "specializations"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "specializations"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "immunizations"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "immunizations"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "staff_details"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "staff_details"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "admissions"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "admissions"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "patient_vitals"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "patient_vitals"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "admission_clinical_tasks"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "admission_clinical_tasks"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "lab_test_categories"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "lab_test_categories"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "lab_tests"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "lab_tests"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "inventory_categories"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "inventory_categories"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "inventory_sub_categories"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "inventory_sub_categories"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "vendors"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "vendors"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "stocks"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "stocks"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "patient_request_items"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "patient_request_items"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "patient_requests"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "patient_requests"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "encounters"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "encounters"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "appointments"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "appointments"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "nicu"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "nicu"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "patients"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "patients"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "vouchers"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "vouchers"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "transactions"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "transactions"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "hmo_rates"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "hmo_rates"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "performance_appraisal_periods"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "performance_appraisal_periods"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "performance_indicators"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "performance_indicators"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "performance_appraisals"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "performance_appraisals"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "performance_comments"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "performance_comments"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "performance_indicator_reports"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "performance_indicator_reports"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "supervisor_evalutions"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "supervisor_evalutions"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "supervisor_evaluation_reports"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "supervisor_evaluation_reports"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "roasters"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "roasters"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "leave_categories"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "leave_categories"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "diagnosis"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "diagnosis"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "leave_applications"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "leave_applications"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "salary_allowances"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "salary_allowances"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "salary_deductions"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "salary_deductions"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "salary_payment_deductions"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "salary_payment_deductions"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "salary_payments"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "salary_payments"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "salary_payment_allowances"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "salary_payment_allowances"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "cafeteria_inventory_categories"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "cafeteria_inventory_categories"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "cafeteria_inventories"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "cafeteria_inventories"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "cafeteria_item_categories"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "cafeteria_item_categories"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "cafeteria_items"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "cafeteria_items"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "antenatal_enrollments"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "antenatal_enrollments"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "antenatal_visits"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "antenatal_visits"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "patient_allergies"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "patient_allergies"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "patient_antenatals"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "patient_antenatals"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "patient_documents"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "patient_documents"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "patient_request_documents"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "patient_request_documents"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "ivf_enrollments"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "ivf_enrollments"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "ivf_down_regulation_charts"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "ivf_down_regulation_charts"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "labour_enrollemnts"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "labour_enrollemnts"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "labour_delivery_records"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "labour_delivery_records"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "labour_measurements"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "labour_measurements"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "labour_risk_assessments"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "labour_risk_assessments"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "labour_vitals"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "labour_vitals"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "lab_groups"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "lab_groups"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "lab_group_tests"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "lab_group_tests"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "lab_parameters"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "lab_parameters"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "request_types"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "request_types"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "lab_specimens"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "lab_specimens"."updated_at" IS NULL`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_75f8e75a828cb64ea9016e52732" FOREIGN KEY ("patient_request_item_id") REFERENCES "patient_request_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_75f8e75a828cb64ea9016e52732"`);
        await queryRunner.query(`COMMENT ON COLUMN "lab_specimens"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "lab_specimens"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "request_types"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "request_types"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "lab_parameters"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "lab_parameters"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "lab_group_tests"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "lab_group_tests"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "lab_groups"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "lab_groups"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "labour_vitals"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "labour_vitals"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "labour_risk_assessments"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "labour_risk_assessments"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "labour_measurements"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "labour_measurements"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "labour_delivery_records"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "labour_delivery_records"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "labour_enrollemnts"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "labour_enrollemnts"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "ivf_down_regulation_charts"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "ivf_down_regulation_charts"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "ivf_enrollments"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "ivf_enrollments"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "patient_request_documents"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "patient_request_documents"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "patient_documents"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "patient_documents"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "patient_antenatals"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "patient_antenatals"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "patient_allergies"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "patient_allergies"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "antenatal_visits"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "antenatal_visits"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "antenatal_enrollments"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "antenatal_enrollments"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "cafeteria_items"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "cafeteria_items"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "cafeteria_item_categories"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "cafeteria_item_categories"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "cafeteria_inventories"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "cafeteria_inventories"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "cafeteria_inventory_categories"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "cafeteria_inventory_categories"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "salary_payment_allowances"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "salary_payment_allowances"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "salary_payments"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "salary_payments"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "salary_payment_deductions"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "salary_payment_deductions"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "salary_deductions"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "salary_deductions"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "salary_allowances"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "salary_allowances"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "leave_applications"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "leave_applications"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "diagnosis"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "diagnosis"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "leave_categories"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "leave_categories"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "roasters"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "roasters"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "supervisor_evaluation_reports"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "supervisor_evaluation_reports"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "supervisor_evalutions"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "supervisor_evalutions"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "performance_indicator_reports"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "performance_indicator_reports"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "performance_comments"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "performance_comments"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "performance_appraisals"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "performance_appraisals"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "performance_indicators"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "performance_indicators"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "performance_appraisal_periods"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "performance_appraisal_periods"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "hmo_rates"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "hmo_rates"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "transactions"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "transactions"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "vouchers"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "vouchers"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "patients"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "patients"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "nicu"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "nicu"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "appointments"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "appointments"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "encounters"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "encounters"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "patient_requests"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "patient_requests"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "patient_request_items"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "patient_request_items"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "stocks"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "stocks"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "vendors"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "vendors"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "inventory_sub_categories"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "inventory_sub_categories"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "inventory_categories"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "inventory_categories"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "lab_tests"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "lab_tests"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "lab_test_categories"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "lab_test_categories"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "admission_clinical_tasks"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "admission_clinical_tasks"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "patient_vitals"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "patient_vitals"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "admissions"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "admissions"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "staff_details"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "staff_details"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "immunizations"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "immunizations"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "specializations"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "specializations"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "users"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "users"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "roles"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "roles"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "permissions"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "permissions"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "departments"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "departments"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "services"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "services"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "hmos"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "hmos"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "room_categories"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "room_categories"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "rooms"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "rooms"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "service_sub_categories"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "service_sub_categories"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "service_categories"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "service_categories"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "consulting_rooms"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "consulting_rooms"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "patient_next_of_kins"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "patient_next_of_kins"."createdAt" IS NULL`);
        await queryRunner.query(`ALTER TABLE "transactions" RENAME CONSTRAINT "UQ_75f8e75a828cb64ea9016e52732" TO "REL_037e8a51b3dd187b96ce20f906"`);
        await queryRunner.query(`ALTER TABLE "transactions" RENAME COLUMN "patient_request_item_id" TO "patient_request_id"`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_037e8a51b3dd187b96ce20f906a" FOREIGN KEY ("patient_request_id") REFERENCES "patient_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
