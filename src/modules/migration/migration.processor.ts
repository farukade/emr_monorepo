import { OnQueueActive, OnQueueCompleted, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { mysqlConnect, slugify } from '../../common/utils/utils';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { LoggerRepository } from '../logger/logger.repository';
import { DiagnosisRepository } from '../settings/diagnosis/diagnosis.repository';
import { HmoOwnerRepository } from '../hmo/repositories/hmo.repository';
import { HmoTypeRepository } from '../hmo/repositories/hmo_type.repository';
import { HmoSchemeRepository } from '../hmo/repositories/hmo_scheme.repository';
import { PatientRepository } from '../patient/repositories/patient.repository';
import { PatientNOKRepository } from '../patient/repositories/patient.nok.repository';
import { ServiceCategoryRepository } from '../settings/services/repositories/service_category.repository';
import { ServiceRepository } from '../settings/services/repositories/service.repository';
import { ServiceCostRepository } from '../settings/services/repositories/service_cost.repository';
import { ManufacturerRepository } from '../inventory/manufacturer/manufacturer.repository';
import { DrugCategoryRepository } from '../inventory/pharmacy/drug/drug_category.repository';
import { DrugGenericRepository } from '../inventory/pharmacy/generic/generic.repository';
import { DrugRepository } from '../inventory/pharmacy/drug/drug.repository';
import { DrugBatchRepository } from '../inventory/pharmacy/batches/batches.repository';
import { ILike, Like } from 'typeorm';
import { LabTestCategoryRepository } from '../settings/lab/repositories/lab.category.repository';
import { SpecimenRepository } from '../settings/lab/repositories/specimen.repository';
import { LabTestRepository } from '../settings/lab/repositories/lab.test.repository';
import { GroupRepository } from '../settings/lab/repositories/group.repository';
import { GroupTest } from '../settings/entities/group_tests.entity';
import * as moment from 'moment';
import { StoreInventoryRepository } from '../inventory/store/store.repository';

@Processor(process.env.MIGRATION_QUEUE_NAME)
export class MigrationProcessor {
    private readonly logger = new Logger(this.constructor.name);

    constructor(
        @InjectRepository(LoggerRepository)
        private loggerRepository: LoggerRepository,
        @InjectRepository(DiagnosisRepository)
        private diagnosisRepository: DiagnosisRepository,
        @InjectRepository(HmoOwnerRepository)
        private hmoOwnerRepository: HmoOwnerRepository,
        @InjectRepository(HmoTypeRepository)
        private hmoTypeRepository: HmoTypeRepository,
        @InjectRepository(HmoSchemeRepository)
        private hmoSchemeRepository: HmoSchemeRepository,
        @InjectRepository(PatientRepository)
        private patientRepository: PatientRepository,
        @InjectRepository(PatientNOKRepository)
        private patientNOKRepository: PatientNOKRepository,
        @InjectRepository(ServiceCategoryRepository)
        private serviceCategoryRepository: ServiceCategoryRepository,
        @InjectRepository(ServiceRepository)
        private serviceRepository: ServiceRepository,
        @InjectRepository(ServiceCostRepository)
        private serviceCostRepository: ServiceCostRepository,
        @InjectRepository(ManufacturerRepository)
        private manufacturerRepository: ManufacturerRepository,
        @InjectRepository(DrugCategoryRepository)
        private drugCategoryRepository: DrugCategoryRepository,
        @InjectRepository(DrugGenericRepository)
        private drugGenericRepository: DrugGenericRepository,
        @InjectRepository(DrugRepository)
        private drugRepository: DrugRepository,
        @InjectRepository(DrugBatchRepository)
        private drugBatchRepository: DrugBatchRepository,
        @InjectRepository(LabTestCategoryRepository)
        private labTestCategoryRepository: LabTestCategoryRepository,
        @InjectRepository(SpecimenRepository)
        private specimenRepository: SpecimenRepository,
        @InjectRepository(LabTestRepository)
        private labTestRepository: LabTestRepository,
        @InjectRepository(GroupRepository)
        private groupRepository: GroupRepository,
        @InjectRepository(StoreInventoryRepository)
        private storeInventoryRepository: StoreInventoryRepository,
    ) {
    }

    @OnQueueActive()
    onActive(job: Job) {
        this.logger.debug(`Processing job ${job.id} of type ${job.name}`);
    }

    @OnQueueCompleted()
    onComplete(job: Job, result: any) {
        this.logger.debug(`Completed job ${job.id} of type ${job.name}`);
    }

    @OnQueueFailed()
    onError(job: Job<any>, error: any) {
        this.logger.error(`Failed job ${job.id} of type ${job.name}: ${error.message}`, error.stack);
    }

    @Process('diagnosis')
    async migrateDiagnosis(job: Job<any>): Promise<any> {
        this.logger.log('migrating diagnosis');

        try {
            const connection = await mysqlConnect();

            let [rows] = await connection.execute('SELECT * FROM `diagnoses`');
            for (const item of rows) {
                const diagnosisFind = await this.diagnosisRepository.findOne({ where: { code: item.code } });
                if (!diagnosisFind) {
                    await this.diagnosisRepository.save({ ...item, description: item.case });
                }
            }

            [rows] = await connection.execute('SELECT * FROM `diagnoses_full`');
            for (const item of rows) {
                const diagnosisFind = await this.diagnosisRepository.findOne({ where: { code: item.code } });
                if (!diagnosisFind) {
                    await this.diagnosisRepository.save({ ...item, description: item.case });
                }
            }
            await connection.end();
            return true;
        } catch (error) {
            console.log(error);
            this.logger.error('migration failed', error.stack);
        }
    }

    @Process('hmo')
    async migrateHmo(job: Job<any>): Promise<any> {
        this.logger.log('migrating hmo');

        try {
            const connection = await mysqlConnect();

            const [rows] = await connection.execute('SELECT insurance_schemes.*, insurance_owners.id as company_id, insurance_owners.company_name, insurance_owners.address, insurance_owners.contact_phone, insurance_owners.contact_email, insurance_type.name as insurance_type_name FROM `insurance_schemes` left join insurance_owners on insurance_owners.id=insurance_schemes.scheme_owner_id left join insurance_type on insurance_type.id = insurance_schemes.insurance_type_id');
            for (const item of rows) {
                let hmoCompany = await this.hmoOwnerRepository.findOne(item.company_id);

                if (!hmoCompany) {
                    hmoCompany = await this.hmoOwnerRepository.save({
                        id: item.company_id,
                        name: item.company_name,
                        address: item.address,
                        phoneNumber: item.contact_phone,
                        email: item.contact_email,
                    });
                }

                const type = await this.hmoTypeRepository.findOne({ where: { name: item.insurance_type_name } });

                await this.hmoSchemeRepository.save({
                    name: item.scheme_name,
                    owner: hmoCompany,
                    hmoType: type,
                    logo: item.logo_url,
                    phoneNumber: item.phone,
                    email: item.email,
                    coverage: 100,
                });
            }
            await connection.end();
            return true;
        } catch (error) {
            console.log(error);
            this.logger.error('migration failed', error.stack);
        }
    }

    @Process('patients')
    async migratePatients(job: Job<any>): Promise<any> {
        this.logger.log('migrating patients');

        try {
            const connection = await mysqlConnect();

            const [rows] = await connection.execute('SELECT patient_demograph.*, insurance_schemes.scheme_name as scheme_name, kin_relation.name as kin_relation_name FROM `patient_demograph` left join insurance_schemes on patient_demograph.scheme_at_registration_id = insurance_schemes.id left join kin_relation on kin_relation.id = patient_demograph.kin_relation_id');
            for (const item of rows) {
                try {
                    const nok = await this.patientNOKRepository.save({
                        surname: item.KinsLastName || '',
                        other_names: item.KinsFirstName || '',
                        phoneNumber: item.KinsPhone || '',
                        address: item.KinsAddress || '',
                        relationship: item.kin_relation_name || '',
                    });

                    let hmo = await this.hmoSchemeRepository.findOne({ where: { name: item.scheme_name } });
                    if (!hmo) {
                        hmo = await this.hmoSchemeRepository.findOne({ where: { name: 'Private' } });
                    }

                    const patient = await this.patientRepository.save({
                        id: +item.patient_ID,
                        legacyPatientId: item.legacy_patient_id,
                        surname: item.lname,
                        other_names: `${item.fname} ${item.mname}`,
                        date_of_birth: item.date_of_birth,
                        occupation: item.occupation,
                        address: item.address,
                        email: item.email,
                        phoneNumber: item.phonenumber,
                        gender: item.sex,
                        ethnicity: item.ethnic,
                        nextOfKin: nok,
                        hmo,
                        bloodGroup: item.bloodgroup,
                        bloodType: item.bloodtype,
                        createdAt: item.enrollment_date,
                    });
                } catch (e) {
                    console.log(e);
                }
            }
            await connection.end();
            return true;
        } catch (error) {
            console.log(error);
            this.logger.error('migration failed', error.stack);
        }
    }

    @Process('services')
    async migrateServices(job: Job<any>): Promise<any> {
        this.logger.log('migrating services');

        try {
            const connection = await mysqlConnect();

            let [rows] = await connection.execute('SELECT * FROM `bills_source`');
            for (const item of rows) {
                const name = item.name.split('_').join(' ');
                await this.serviceCategoryRepository.save({
                    name,
                    slug: slugify(name),
                });
            }

            [rows] = await connection.execute('SELECT * FROM `insurance_billable_items`');
            for (const item of rows) {
                await this.serviceRepository.save({
                    name: item.item_description,
                    code: item.item_code,
                    category: item.item_group_category_id,
                });
            }

            [rows] = await connection.execute('SELECT insurance_items_cost.item_code, insurance_items_cost.selling_price, insurance_schemes.scheme_name FROM `insurance_items_cost` left join insurance_schemes on insurance_schemes.id=insurance_items_cost.insurance_scheme_id');
            for (const item of rows) {
                const service = await this.serviceRepository.findOne({
                    where: { code: item.item_code },
                });

                const hmo = await this.hmoSchemeRepository.findOne({
                    where: { name: item.scheme_name },
                });

                await this.serviceCostRepository.save({
                    item: service,
                    hmo,
                    code: item.item_code,
                    tariff: item.selling_price,
                });
            }

            await connection.end();
            return true;
        } catch (error) {
            console.log(error);
            this.logger.error('migration failed', error.stack);
        }
    }

    @Process('drugs')
    async migrateDrugs(job: Job<any>): Promise<any> {
        this.logger.log('migrating drugs');

        try {
            const connection = await mysqlConnect();

            let [rows] = await connection.execute('SELECT * FROM `drug_manufacturers`');
            for (const item of rows) {
                await this.manufacturerRepository.save({ name: item.name });
            }

            [rows] = await connection.execute('SELECT * FROM `drug_category`');
            for (const item of rows) {
                await this.drugCategoryRepository.save({ name: item.name });
            }

            [rows] = await connection.execute('SELECT drug_generics.id, drug_generics.name, drug_category.name as category_name, drug_generics.form, drug_generics.weight, drug_generics.low_stock_level FROM `drug_generics` left join drug_category on drug_category.id=drug_generics.category_ids');
            for (const item of rows) {
                const category = await this.drugCategoryRepository.findOne({
                    where: { name: item.category_name },
                });

                await this.drugGenericRepository.save({
                    id: item.id,
                    name: item.name,
                    category,
                    form: item.form,
                    weight: item.weight,
                    lowStockLevel: item.low_stock_level ? parseInt(item.low_stock_level, 10) : 0,
                });
            }

            [rows] = await connection.execute('SELECT drugs.name, drugs.billing_code, drug_generics.name as generic_name, drugs.base_price, drugs.unit_cost, drugs.stock_uom, drug_manufacturers.name as manufacturer_name FROM `drugs` left join drug_generics on drug_generics.id=drugs.drug_generic_id left join drug_manufacturers on drug_manufacturers.id=drugs.manufacturer_id');
            for (const item of rows) {
                const generic = await this.drugGenericRepository.findOne({
                    where: { name: item.generic_name },
                });

                const manufacturer = await this.manufacturerRepository.findOne({
                    where: { name: item.manufacturer_name },
                });

                await this.drugRepository.save({
                    name: item.name,
                    code: item.billing_code,
                    generic,
                    unitOfMeasure: item.stock_uom,
                    manufacturer,
                });
            }

            [rows] = await connection.execute('SELECT drug_batch.*, drugs.name as drug_name FROM `drug_batch` left join drugs on drugs.id=drug_batch.drug_id');
            for (const item of rows) {
                const drug = await this.drugRepository.findOne({
                    where: { code: ILike(`%${item.drug_id}%`) },
                });

                const expirationDate = moment(item.expiration_date).isValid() ? moment(item.expiration_date).format('YYYY-MM-DD') : null;

                await this.drugBatchRepository.save({
                    name: item.name,
                    drug,
                    quantity: item.quantity,
                    unitPrice: item.unit_price,
                    costPrice: 0,
                    expirationDate,
                });
            }

            await connection.end();
            return true;
        } catch (error) {
            console.log(error);
            this.logger.error('migration failed', error.stack);
        }
    }

    @Process('lab')
    async migrateLab(job: Job<any>): Promise<any> {
        this.logger.log('migrating lab');

        try {
            const connection = await mysqlConnect();

            let [rows] = await connection.execute('SELECT * FROM `labtests_config_category`');
            for (const item of rows) {
                await this.labTestCategoryRepository.save({ name: item.name });
            }

            [rows] = await connection.execute('SELECT * FROM `lab_specimen`');
            for (const item of rows) {
                await this.specimenRepository.save({ name: item.name });
            }

            [rows] = await connection.execute('SELECT labtests_config.*, labtests_config_category.name as lab_category FROM `labtests_config` left join labtests_config_category on labtests_config_category.id=labtests_config.category_id');
            for (const item of rows) {
                const category = await this.labTestCategoryRepository.findOne({ name: item.lab_category });

                await this.labTestRepository.save({
                    code: item.billing_code,
                    name: item.name,
                    category,
                });
            }

            [rows] = await connection.execute('SELECT * FROM `lab_combo`');
            for (const item of rows) {
                await this.groupRepository.save({ name: item.name, slug: slugify(item.name) });
            }

            [rows] = await connection.execute('SELECT labtests_config.billing_code, lab_combo.name as lc FROM `lab_combo_data` join lab_combo on lab_combo.id=lab_combo_data.lab_combo_id join labtests_config on labtests_config.id=lab_combo_data.lab_id');
            for (const item of rows) {
                const lab = await this.labTestRepository.findOne({ code: item.billing_code });
                if (item.lc && item.lc !== '') {
                    const group = await this.groupRepository.findOne({ slug: slugify(item.lc) });

                    const groupTest = new GroupTest();
                    groupTest.group = group;
                    groupTest.labTest = lab;
                    await groupTest.save();
                }
            }

            await connection.end();
            return true;
        } catch (error) {
            console.log(error);
            this.logger.error('migration failed', error.stack);
        }
    }

    @Process('store')
    async migrateStore(job: Job<any>): Promise<any> {
        this.logger.log('migrating store');

        try {
            const connection = await mysqlConnect();

            const [rows] = await connection.execute('SELECT * FROM `insurance_billable_items` where item_group_category_id=11');
            for (const item of rows) {
                await this.storeInventoryRepository.save({
                    name: item.item_description,
                    slug: slugify(item.item_description),
                    description: item.item_description,
                    code: item.item_code,
                });
            }

            await connection.end();
            return true;
        } catch (error) {
            console.log(error);
            this.logger.error('migration failed', error.stack);
        }
    }
}
