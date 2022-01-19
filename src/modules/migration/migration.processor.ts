import { OnQueueActive, OnQueueCompleted, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { callPatient1, formatPID, hasNumber, mysqlConnect, slugify } from '../../common/utils/utils';
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
import { LabTestCategoryRepository } from '../settings/lab/repositories/lab.category.repository';
import { SpecimenRepository } from '../settings/lab/repositories/specimen.repository';
import { LabTestRepository } from '../settings/lab/repositories/lab.test.repository';
import { GroupRepository } from '../settings/lab/repositories/group.repository';
import { GroupTest } from '../settings/entities/group_tests.entity';
import * as moment from 'moment';
import { StoreInventoryRepository } from '../inventory/store/store.repository';
// @ts-ignore
import * as startCase from 'lodash.startcase';
import { CafeteriaInventoryRepository } from '../inventory/cafeteria/cafeteria.repository';
import { RoomCategoryRepository } from '../settings/room/room.category.repository';
import { ServiceCost } from '../settings/entities/service_cost.entity';
import { StaffRepository } from '../hr/staff/staff.repository';
import { AuthRepository } from '../auth/auth.repository';
import * as bcrypt from 'bcrypt';
import { RoleRepository } from '../settings/roles-permissions/role.repository';
import { getConnection, Raw } from 'typeorm';
import { PatientAlertRepository } from '../patient/repositories/patient_alert.repository';
import { AdmissionsRepository } from '../patient/admissions/repositories/admissions.repository';
import { PatientNoteRepository } from '../patient/repositories/patient_note.repository';
import { EncounterRepository } from '../patient/consultation/encounter.repository';
import { CareTeamRepository } from '../patient/care-team/team.repository';
import { AppointmentRepository } from '../frontdesk/appointment/appointment.repository';
import { Department } from '../settings/entities/department.entity';
import { Service } from '../settings/entities/service.entity';
import { AppGateway } from '../../app.gateway';
import { NicuRepository } from '../patient/nicu/nicu.repository';
import { PatientNote } from '../patient/entities/patient_note.entity';
import { PatientRequestItemRepository } from '../patient/repositories/patient_request_items.repository';

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
		@InjectRepository(CafeteriaInventoryRepository)
		private cafeteriaInventoryRepository: CafeteriaInventoryRepository,
		@InjectRepository(RoomCategoryRepository)
		private roomCategoryRepository: RoomCategoryRepository,
		@InjectRepository(StaffRepository)
		private staffRepository: StaffRepository,
		@InjectRepository(AuthRepository)
		private authRepository: AuthRepository,
		@InjectRepository(RoleRepository)
		private roleRepository: RoleRepository,
		@InjectRepository(PatientAlertRepository)
		private patientAlertRepository: PatientAlertRepository,
		@InjectRepository(AdmissionsRepository)
		private admissionsRepository: AdmissionsRepository,
		@InjectRepository(PatientNoteRepository)
		private patientNoteRepository: PatientNoteRepository,
		@InjectRepository(EncounterRepository)
		private encounterRepository: EncounterRepository,
		@InjectRepository(CareTeamRepository)
		private careTeamRepository: CareTeamRepository,
		@InjectRepository(AppointmentRepository)
		private appointmentRepository: AppointmentRepository,
		@InjectRepository(NicuRepository)
		private nicuRepository: NicuRepository,
		@InjectRepository(PatientRequestItemRepository)
		private patientRequestItemRepository: PatientRequestItemRepository,
		private readonly appGateway: AppGateway,
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

	async getStaffById(id): Promise<any> {
		let staff = null;

		if (id && id !== '') {
			staff = await this.staffRepository.findOne({
				where: { old_id: id },
				relations: ['user'],
			});
		}

		return staff;
	}

	@Process('diagnosis')
	async migrateDiagnosis(job: Job<any>): Promise<any> {
		this.logger.log('migrating diagnosis');

		try {
			const connection = await mysqlConnect();

			let [rows] = await connection.execute('SELECT * FROM `diagnoses`');
			for (const item of rows) {
				const diagnosisFind = await this.diagnosisRepository.findOne({
					where: { code: item.code, type: item.type },
				});
				if (!diagnosisFind) {
					await this.diagnosisRepository.save({ ...item, old_id: item.id, description: item.case });
				}
			}

			[rows] = await connection.execute('SELECT * FROM `diagnoses_full`');
			for (const item of rows) {
				const diagnosisFind = await this.diagnosisRepository.findOne({
					where: { code: item.code, type: item.type },
				});
				if (!diagnosisFind) {
					await this.diagnosisRepository.save({ ...item, old_id: item.id, description: item.case });
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

			const [rows] = await connection.execute('SELECT insurance_schemes.*, insurance_schemes.id as scheme_id, insurance_owners.id as company_id, insurance_owners.company_name, insurance_owners.address, insurance_owners.contact_phone, insurance_owners.contact_email, insurance_type.name as insurance_type_name FROM `insurance_schemes` left join insurance_owners on insurance_owners.id=insurance_schemes.scheme_owner_id left join insurance_type on insurance_type.id = insurance_schemes.insurance_type_id');
			for (const item of rows) {
				let hmoCompany = await this.hmoOwnerRepository.findOne(item.company_id);

				if (!hmoCompany) {
					hmoCompany = await this.hmoOwnerRepository.save({
						id: item.company_id,
						name: item.company_name,
						address: item.address,
						phoneNumber: item.contact_phone,
						email: item.contact_email,
						old_id: item.company_id,
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
					old_id: item.scheme_id,
				});
			}
			await connection.end();
			return true;
		} catch (error) {
			console.log(error);
			this.logger.error('migration failed', error.stack);
		}
	}

	@Process('staffs')
	async migrateStaffs(job: Job<any>): Promise<any> {
		this.logger.log('migrating staffs');
		try {
			const connection = await mysqlConnect();

			const [rows] = await connection.execute('SELECT * FROM `staff_directory` WHERE `username` NOT LIKE \'%admin%\'');
			for (const item of rows) {
				try {
					let name = item.profession;
					if (item.profession === 'Pharmacist') {
						name = 'Pharmacy';
					} else if (item.profession === 'Lab Scientist' || item.profession === 'Lab Technician') {
						name = 'Laboratory';
					} else if (item.profession === 'Medical Records') {
						name = 'Records';
					} else if (item.profession === 'Embryologist') {
						name = 'IVF';
					} else if (item.profession === 'Admin') {
						name = 'Accounts';
					} else if (item.profession === 'Accounts Officer') {
						name = 'Paypoint';
					}

					const role = await this.roleRepository.findOne({ where: { slug: slugify(name) } });

					const user = await this.authRepository.save({
						username: item.username.toLocaleLowerCase(),
						password: await this.getHash('password'),
						role,
					});

					let checkEmail = await this.staffRepository.findOne({ where: { email: item.email } });

					let email = item.email;
					while (checkEmail) {
						const split = checkEmail.email.split('@');
						email = `${split[0]}1@${split[1]}`;

						checkEmail = await this.staffRepository.findOne({ where: { email } });
					}

					await this.staffRepository.save({
						old_id: item.staffId,
						user,
						first_name: item.firstname,
						last_name: item.lastname,
						phone_number: item.phone,
						email,
						is_consultant: item.is_consultant === 1,
						profession: item.profession,
						isActive: item.status === 'active',
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

	@Process('patients')
	async migratePatients(job: Job<any>): Promise<any> {
		this.logger.log('migrating patients');

		try {
			const connection = await mysqlConnect();

			const [rows] = await connection.execute('SELECT patient_demograph.*, insurance.insurance_scheme as scheme_id, insurance_schemes.scheme_name as scheme_name, kin_relation.name as kin_relation_name FROM `patient_demograph` left join insurance on insurance.patient_id = patient_demograph.patient_ID left join insurance_schemes on insurance.insurance_scheme = insurance_schemes.id left join kin_relation on kin_relation.id = patient_demograph.kin_relation_id');
			for (const item of rows) {
				try {
					const nok = await this.patientNOKRepository.save({
						surname: item.KinsLastName || '',
						other_names: item.KinsFirstName || '',
						phoneNumber: item.KinsPhone || '',
						address: item.KinsAddress || '',
						relationship: item.kin_relation_name || '',
					});

					let hmo = await this.hmoSchemeRepository.findOne({ where: { old_id: item.scheme_id } });
					if (!hmo) {
						hmo = await this.hmoSchemeRepository.findOne({ where: { name: 'Private' } });
					}

					const creator = await this.getStaffById(parseInt(item.registered_By, 10));

					const patient = {
						old_id: item.patient_ID,
						id: +item.patient_ID,
						legacy_patient_id: item.legacy_patient_id,
						surname: item.lname,
						other_names: `${item.fname} ${item.mname}`,
						date_of_birth: moment(item.date_of_birth, 'YYYY-MM-DD').format('YYYY-MM-DD'),
						occupation: item.occupation,
						address: item.address,
						email: item?.email?.toLocaleLowerCase() || null,
						phone_number: item.phonenumber,
						gender: item.sex,
						ethnicity: item.ethnic,
						nextOfKin: nok,
						hmo,
						blood_group: item.bloodgroup,
						blood_type: item.bloodtype,
						createdAt: item.enrollment_date,
						createdBy: creator?.user?.username || 'it-admin',
						title: item?.title?.replace('|', '') || '',
					};

					let deleted_at = null;
					if (item.deactivated_on && item.deactivated_on !== '' && item.active === 0) {
						deleted_at = moment(item.deactivated_on).format('YYYY-MM-DD HH:mm:ss');
					}

					let staff = null;
					if (hmo && hmo.name === 'STAFF') {
						staff = await this.staffRepository.findOne({
							where: {
								first_name: Raw((alias) => `LOWER(${alias}) = :first`, { first: item.fname?.toLocaleLowerCase() || '' }),
								last_name: Raw((alias) => `LOWER(${alias}) = :last`, { last: item.lname?.toLocaleLowerCase() || '' }),
							},
						});
					}

					await this.patientRepository.save({ ...patient, staff, deleted_at });
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
					old_id: item.id,
				});
			}

			[rows] = await connection.execute('SELECT * FROM `insurance_billable_items`');
			for (const item of rows) {
				await this.serviceRepository.save({
					name: item.item_description,
					code: item.item_code,
					category: item.item_group_category_id,
					old_id: item.id,
				});
			}

			[rows] = await connection.execute('SELECT * FROM `insurance_items_cost`');
			for (const item of rows) {
				if (item.item_code && item.item_code !== '') {
					const service = await this.serviceRepository.findOne({
						where: { code: item.item_code },
					});

					const hmo = await this.hmoSchemeRepository.findOne({
						where: { old_id: item.insurance_scheme_id },
					});

					await this.serviceCostRepository.save({
						item: service,
						hmo,
						code: item.item_code,
						tariff: item.selling_price,
						old_id: item.id,
					});
				}
			}

			await connection.end();

			const services = await this.serviceRepository.find();
			const privateHmo = await this.hmoSchemeRepository.findOne({ where: { name: 'Private' } });
			for (const item of services) {
				const rs = await this.serviceCostRepository.findOne({
					where: { code: item.code, hmo: privateHmo },
				});

				if (!rs) {
					await getConnection().createQueryBuilder().delete().from(Service)
						.where('id = :id', { id: item.id })
						.execute();
				}
			}
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
					old_id: item.id,
					name: item.name,
					category,
					form: item.form,
					weight: item.weight,
					lowStockLevel: item.low_stock_level ? parseInt(item.low_stock_level, 10) : 0,
				});
			}

			[rows] = await connection.execute('SELECT drugs.id as drug_id, drugs.name, drugs.billing_code, drugs.drug_generic_id, drugs.base_price, drugs.unit_cost, drugs.stock_uom, drug_manufacturers.name as manufacturer_name FROM `drugs` left join drug_generics on drug_generics.id=drugs.drug_generic_id left join drug_manufacturers on drug_manufacturers.id=drugs.manufacturer_id');
			for (const item of rows) {
				const generic = await this.drugGenericRepository.findOne({
					where: { old_id: item.drug_generic_id },
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
					old_id: item.drug_id,
				});
			}

			[rows] = await connection.execute('SELECT drug_batch.*, drugs.name as drug_name FROM `drug_batch` left join drugs on drugs.id=drug_batch.drug_id');
			for (const item of rows) {
				const drug = await this.drugRepository.findOne({
					where: { old_id: item.drug_id },
				});

				const expirationDate = moment(item.expiration_date).isValid() ? moment(item.expiration_date).format('YYYY-MM-DD') : null;

				await this.drugBatchRepository.save({
					old_id: item.id,
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

			[rows] = await connection.execute('SELECT labtests_config.*, labtests_config.id as lab_id, labtests_config_category.name as lab_category FROM `labtests_config` left join labtests_config_category on labtests_config_category.id=labtests_config.category_id');
			for (const item of rows) {
				const category = await this.labTestCategoryRepository.findOne({ name: item.lab_category });

				await this.labTestRepository.save({
					code: item.billing_code,
					name: item.name,
					category,
					old_id: item.lab_id,
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

			let [rows] = await connection.execute('SELECT * FROM `store`');
			let count = 0;
			for (const item of rows) {
				count++;

				const code = `ST${formatPID(count, 8)}`;
				const name = hasNumber(item.name) ? item.name : startCase(item.name.toLocaleLowerCase());
				const unit = hasNumber(item.name) ? item.unit_of_measure : startCase(item.unit_of_measure.toLocaleLowerCase());

				await this.storeInventoryRepository.save({ name, unitOfMeasure: unit, code });
			}

			[rows] = await connection.execute('SELECT * FROM `store_cafeteria`');
			count = 0;
			for (const item of rows) {
				count++;

				const code = `CA${formatPID(count, 8)}`;
				const name = hasNumber(item.name) ? item.name : startCase(item.name.toLocaleLowerCase());
				const unit = item.unit_of_measure;

				await this.cafeteriaInventoryRepository.save({ name, unitOfMeasure: unit, code });
			}

			await connection.end();
			return true;
		} catch (error) {
			console.log(error);
			this.logger.error('migration failed', error.stack);
		}
	}

	@Process('rooms')
	async migrateRoom(job: Job<any>): Promise<any> {
		this.logger.log('migrating rooms');

		try {
			const connection = await mysqlConnect();

			const [rows] = await connection.execute('SELECT * FROM `ward`');
			for (const item of rows) {
				await this.roomCategoryRepository.save({
					name: item.name,
					code: item.billing_code,
					old_id: item.id,
				});
			}

			await connection.end();
			return true;
		} catch (error) {
			console.log(error);
			this.logger.error('migration failed', error.stack);
		}
	}

	async getHash(password: string | undefined): Promise<string> {
		return bcrypt.hash(password, 10);
	}

	@Process('alert')
	async migrateAlert(job: Job<any>): Promise<any> {
		this.logger.log('migrating patient alerts');

		try {
			const connection = await mysqlConnect();

			const [rows] = await connection.execute('SELECT * FROM `alert`');
			for (const item of rows) {
				const patient = await this.patientRepository.findOne({
					where: { old_id: item.patient_id },
				});

				await this.patientAlertRepository.save({
					patient,
					type: item.type,
					message: item.message,
					read: item.read === 1,
					createdAt: moment(item.time).format('YYYY-MM-DD HH:mm:ss'),
				});
			}

			await connection.end();
			return true;
		} catch (error) {
			console.log(error);
			this.logger.error('migration failed', error.stack);
		}
	}

	@Process('in-patients')
	async migrateInPatients(job: Job<any>): Promise<any> {
		this.logger.log('migrating in-patients');

		try {
			const connection = await mysqlConnect();

			const [rows] = await connection.execute('SELECT in_patient.*, health_state.state as health_state FROM `in_patient` left join health_state on health_state.id = in_patient.health_state_id');
			for (const item of rows) {
				const patient = await this.patientRepository.findOne({
					where: { old_id: item.patient_id },
				});

				const createdBy = await this.getStaffById(parseInt(item.admitted_by, 10));

				const startDischargedBy = await this.getStaffById(parseInt(item.discharged_by, 10));

				const dischargedBy = await this.getStaffById(parseInt(item.discharged_by_full, 10));

				await this.admissionsRepository.save({
					patient,
					health_state: item.health_state,
					risk_to_fall: item.risk_to_fall === 1,
					room_assigned_at: item.bed_assign_date ? moment(item.bed_assign_date).format('YYYY-MM-DD HH:mm:ss') : null,
					reason: item.reason,
					status: item.status === 'Discharged' ? 1 : 0,
					start_discharge: item.status === 'Discharging',
					start_discharge_date: item.date_discharged ? moment(item.date_discharged).format('YYYY-MM-DD HH:mm:ss') : null,
					start_discharge_by: startDischargedBy?.user?.username || null,
					date_discharged: item.date_discharged_full ? moment(item.date_discharged_full).format('YYYY-MM-DD HH:mm:ss') : null,
					dischargedBy,
					discharge_note: item.discharge_note,
					createdAt: moment(item.date_admitted).format('YYYY-MM-DD HH:mm:ss'),
					createdBy: createdBy?.user?.username || null,
					old_id: item.id,
				});
			}

			await connection.end();
			return true;
		} catch (error) {
			console.log(error);
			this.logger.error('migration failed', error.stack);
		}
	}

	@Process('observation')
	async migrateObservation(job: Job<any>): Promise<any> {
		this.logger.log('migrating in-patient observation');

		try {
			const connection = await mysqlConnect();

			const [rows] = await connection.execute('SELECT * FROM `ip_observation`');
			for (const item of rows) {
				const admission = await this.admissionsRepository.findOne({
					where: { old_id: item.in_patient_id },
					relations: ['patient'],
				});

				const createdBy = await this.getStaffById(item.user_id);

				await this.patientNoteRepository.save({
					admission,
					patient: admission?.patient ?? null,
					description: item.note,
					createdAt: moment(item.date).format('YYYY-MM-DD HH:mm:ss'),
					createdBy: createdBy?.user?.username || null,
					type: 'nurse-observation',
					old_id: item.id,
				});
			}

			await connection.end();
			return true;
		} catch (error) {
			console.log(error);
			this.logger.error('migration failed', error.stack);
		}
	}

	@Process('allergen')
	async migrateAllergen(job: Job<any>): Promise<any> {
		this.logger.log('migrating allergen');

		try {
			const connection = await mysqlConnect();

			const [rows] = await connection.execute('SELECT patient_allergen.*, allergen_category.name, drug_generics.id as generic_id FROM `patient_allergen` left join allergen_category on allergen_category.id = patient_allergen.category_id left join drug_super_generic_data on drug_super_generic_data.super_generic_id = patient_allergen.drug_super_gen_id left join drug_generics on drug_generics.id = drug_super_generic_data.drug_generic_id');
			for (const item of rows) {
				const patient = await this.patientRepository.findOne({
					where: { old_id: item.patient_ID },
				});

				const createdBy = await this.getStaffById(parseInt(item.noted_by, 10));

				const generic = item.generic_id ? await this.drugGenericRepository.findOne(item.generic_id) : null;

				const encounter = item.encounter_id ? await this.encounterRepository.findOne({ where: { old_id: item.encounter_id } }) : null;

				await this.patientNoteRepository.save({
					patient,
					category: item.category_name,
					allergy: item.allergen,
					drugGeneric: generic,
					severity: item.severity,
					reaction: item.reaction,
					encounter,
					visit: encounter ? 'encounter' : null,
					type: 'allergy',
					createdAt: moment(item.date_noted).format('YYYY-MM-DD HH:mm:ss'),
					createdBy: createdBy?.user?.username || null,
					old_id: item.id,
				});
			}

			await connection.end();
			return true;
		} catch (error) {
			console.log(error);
			this.logger.error('migration failed', error.stack);
		}
	}

	@Process('care-team')
	async migrateCareTeam(job: Job<any>): Promise<any> {
		this.logger.log('migrating care-team');

		try {
			const connection = await mysqlConnect();

			const [rows] = await connection.execute('SELECT * FROM `patient_care_member`');
			for (const item of rows) {
				const member = await this.getStaffById(parseInt(item.care_member_id, 10));

				const primaryMember = await this.getStaffById(parseInt(item.primary_care_id, 10));

				const createdBy = await this.getStaffById(parseInt(item.created_by, 10));

				const admission = await this.admissionsRepository.findOne({
					where: { old_id: item.in_patient_id },
					relations: ['patient'],
				});

				console.log('---------------------------------');
				console.log(item);
				console.log(`${member?.id} ---- ${primaryMember?.id}`);

				await this.careTeamRepository.save({
					member,
					isPrimaryCareGiver: member?.id === primaryMember?.id,
					patient: admission?.patient,
					type: admission ? 'admission' : null,
					item_id: admission?.id?.toString(10),
					createdAt: moment(item.entry_time).format('YYYY-MM-DD HH:mm:ss'),
					createdBy: createdBy?.user?.username || null,
					old_id: item.id,
				});
			}

			await connection.end();
			return true;
		} catch (error) {
			console.log(error);
			this.logger.error('migration failed', error.stack);
		}
	}

	@Process('encounter')
	async migrateEncounter(job: Job<any>): Promise<any> {
		this.logger.log('migrating encounter');

		try {
			const connection = await mysqlConnect();

			const [rows] = await connection.execute('SELECT encounter.*, departments.name as department_name FROM `encounter` join departments on departments.id=encounter.department_id');
			for (const item of rows) {
				const patient = await this.patientRepository.findOne({
					where: { old_id: item.patient_id },
				});

				const doctor = await this.getStaffById(parseInt(item.consulted_by, 10));

				const department = await getConnection().getRepository(Department).findOne({
					where: { name: item.department_name },
				});

				const createdBy = await this.getStaffById(parseInt(item.initiator_id, 10));

				const appointment = await this.appointmentRepository.save({});

				if (item.consulted_on) {
					await this.encounterRepository.save({
						patient,
						appointment,
						createdAt: moment(item.consulted_on).format('YYYY-MM-DD HH:mm:ss'),
						createdBy: doctor?.user?.username || null,
						old_id: item.id,
					});
				}
			}

			await connection.end();
			return true;
		} catch (error) {
			console.log(error);
			this.logger.error('migration failed', error.stack);
		}
	}

	@Process('call')
	async callPatient(job: Job<any>): Promise<any> {
		this.logger.log('calling patient');

		try {
			await callPatient1(2140);
		} catch (error) {
			console.log(error);
			this.logger.error('migration failed', error.stack);
		}
	}

	@Process('tariffs')
	async updateCoverage(job: Job<any>): Promise<any> {
		const { scheme, coverage } = job.data;

		const privateHmo = await this.hmoSchemeRepository.findOne({ where: { name: 'Private' } });
		if (privateHmo.name === scheme.name) {
			this.logger.log('cannot change private services');
			return;
		}

		// get all private hmos
		const privateServiceCosts = await this.serviceCostRepository.find({
			where: { hmo: privateHmo },
		});

		for (const cost of privateServiceCosts) {
			const service = await this.serviceRepository.findOne(cost?.item?.id || '');
			if (service) {
				const serviceCost = await this.serviceCostRepository.findOne({
					where: { hmo: scheme, code: service.code },
				});
				if (!serviceCost) {
					const costItem = new ServiceCost();
					costItem.code = service.code;
					costItem.item = service;
					costItem.tariff = 0;
					costItem.hmo = scheme;
					await costItem.save();
				}
			}
		}
	}

	@Process('fix-inpatients')
	async fixInPatients(job: Job<any>): Promise<any> {
		const admissions = await this.admissionsRepository.find({
			where: { status: 0 },
			relations: ['patient'],
		});

		for (const admission of admissions) {
			const patient = await this.patientRepository.findOne(admission.patient.id);

			if (patient) {
				patient.admission_id = admission.id;
				await patient.save();
			}
		}

		const nicus = await this.nicuRepository.find({
			where: { status: 0 },
			relations: ['patient'],
		});

		for (const nicu of nicus) {
			const patient = await this.patientRepository.findOne(nicu.patient.id);

			if (patient) {
				patient.nicu_id = nicu.id;
				await patient.save();
			}
		}
	}

	@Process('transfer-dn')
	async transferDischargeNote(job: Job<any>): Promise<any> {
		const admissions = await this.admissionsRepository.find({
			where: { status: 1 },
			relations: ['patient', 'dischargedBy', 'dischargedBy.user'],
		});

		for (const admission of admissions) {
			const patient = await this.patientRepository.findOne(admission.patient.id);

			if (admission.discharge_note) {
				const note  = new PatientNote();
				note.description = admission.discharge_note;
				note.patient = patient;
				note.admission = admission;
				note.type = 'discharge';
				note.createdBy = admission?.dischargedBy?.user?.username || 'it-admin';

				await note.save();
			}
		}
	}

	@Process('fix-procedure')
	async fixProcedure(job: Job<any>): Promise<any> {
		const items = await this.patientRequestItemRepository.find({
			where: { scheduledDate: true },
		});

		for (const item of items) {
			try {
				const request = await this.patientRequestItemRepository.findOne(item.id);
				if (request) {
					const startDate = moment(request.scheduledStartDate, 'DD/MM/YYYY h:mm A');
					const endDate = moment(request.scheduledEndDate, 'DD/MM/YYYY h:mm A');

					request.scheduledStartDate = startDate.format('YYYY-MM-DD HH:mm:ss');
					request.scheduledEndDate = endDate.format('YYYY-MM-DD HH:mm:ss');
					await request.save();
				}
			} catch (e) {
				console.log(e);
			}
		}
	}

	@Process('emit-socket')
	async emitSocket(job: Job<any>): Promise<any> {
		this.appGateway.server.emit('new-appointment', { appointment: 1 });
	}
}
