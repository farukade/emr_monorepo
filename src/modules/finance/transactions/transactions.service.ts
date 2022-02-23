import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionsRepository } from './transactions.repository';
import * as moment from 'moment';
import { PatientRepository } from '../../patient/repositories/patient.repository';
import { ProcessTransactionDto } from './dto/process-transaction.dto';
import { VoucherRepository } from '../vouchers/voucher.repository';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { QueueSystemRepository } from '../../frontdesk/queue-system/queue-system.repository';
import { AppointmentRepository } from '../../frontdesk/appointment/appointment.repository';
import { AppGateway } from '../../../app.gateway';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { Brackets, getConnection } from 'typeorm';
import { createServiceCost, getDepositBalance, getSerialCode, getStaff, postCredit, postDebit } from '../../../common/utils/utils';
import { Settings } from '../../settings/entities/settings.entity';
import { ServiceCostRepository } from '../../settings/services/repositories/service_cost.repository';
import { HmoSchemeRepository } from '../../hmo/repositories/hmo_scheme.repository';
import { PatientRequestItemRepository } from '../../patient/repositories/patient_request_items.repository';
import { TransactionCreditDto } from './dto/transaction-credit.dto';
import { AccountDeposit } from './entities/deposit.entity';
import { Transaction } from './transaction.entity';
import { Admission } from '../../patient/admissions/entities/admission.entity';
import { Nicu } from '../../patient/nicu/entities/nicu.entity';
import { Queue } from 'src/modules/frontdesk/queue-system/queue.entity';
import { PatientRequestRepository } from '../../patient/repositories/patient_request.repository';
import { ServiceCost } from '../../settings/entities/service_cost.entity';
import { PatientRequestItem } from '../../patient/entities/patient_request_items.entity';
import { AdmissionsRepository } from '../../patient/admissions/repositories/admissions.repository';

@Injectable()
export class TransactionsService {

	constructor(
		@InjectRepository(AppointmentRepository)
		private appointmentRepository: AppointmentRepository,
		@InjectRepository(TransactionsRepository)
		private transactionsRepository: TransactionsRepository,
		@InjectRepository(PatientRepository)
		private patientRepository: PatientRepository,
		@InjectRepository(ServiceCostRepository)
		private serviceCostRepository: ServiceCostRepository,
		@InjectRepository(VoucherRepository)
		private voucherRepository: VoucherRepository,
		@InjectRepository(HmoSchemeRepository)
		private hmoSchemeRepository: HmoSchemeRepository,
		@InjectRepository(QueueSystemRepository)
		private queueSystemRepository: QueueSystemRepository,
		@InjectRepository(PatientRequestItemRepository)
		private patientRequestItemRepository: PatientRequestItemRepository,
		@InjectRepository(PatientRequestRepository)
		private patientRequestRepository: PatientRequestRepository,
		@InjectRepository(AdmissionsRepository)
		private admissionRepository: AdmissionsRepository,
		private readonly appGateway: AppGateway,
	) {
	}

	async fetchList(options: PaginationOptionsInterface, params): Promise<Pagination> {
		const { startDate, endDate, patient_id, staff_id, bill_source, status } = params;

		const page = options.page - 1;

		const query = this.transactionsRepository.createQueryBuilder('q').select('q.*')
			.where('q.payment_type = :type', { type: 'self' });

		if (bill_source && bill_source !== '') {
			query.where('q.bill_source = :type', { type: bill_source });
		}

		if (startDate && startDate !== '' && endDate && endDate !== '' && endDate === startDate) {
			query.andWhere(`DATE(q.createdAt) = '${startDate}'`);
		} else {
			if (startDate && startDate !== '') {
				const start = moment(startDate).endOf('day').toISOString();
				query.andWhere(`q.createdAt >= '${start}'`);
			}
			if (endDate && endDate !== '') {
				const end = moment(endDate).endOf('day').toISOString();
				query.andWhere(`q.createdAt <= '${end}'`);
			}
		}

		if (patient_id && patient_id !== '') {
			query.andWhere('q.patient_id = :patient_id', { patient_id });
		}

		if (staff_id && staff_id !== '') {
			query.andWhere('q.staff_id = :staff_id', { staff_id });
		}

		if (status && status !== '') {
			if (status === 1) {
				query.andWhere('q.status = :status', { status: 1 });
			} else {
				query.andWhere(new Brackets(qb => {
					qb.where('q.status = :status', { status: 0 }).orWhere('q.status = :status', { status: -1 });
				}));
			}
		}

		const transactions = await query.offset(page * options.limit)
			.limit(options.limit)
			.orderBy('q.createdAt', 'DESC')
			.getRawMany();

		const total = await query.getCount();

		for (const transaction of transactions) {
			transaction.hmo = await this.hmoSchemeRepository.findOne(transaction.hmo_scheme_id);

			transaction.staff = await getStaff(transaction.lastChangedBy);

			if (transaction.patient_id) {
				transaction.patient = await this.patientRepository.findOne(transaction.patient_id, {
					relations: ['nextOfKin', 'immunization', 'hmo'],
				});
			}

			if (transaction.service_cost_id) {
				transaction.service = await this.serviceCostRepository.findOne(transaction.service_cost_id);
			}

			if (transaction.patient_request_item_id) {
				transaction.patientRequestItem = await this.patientRequestItemRepository.findOne(transaction.patient_request_item_id, { relations: ['request'] });
			}

			transaction.admission = transaction.admission_id ? await this.admissionRepository.findOne(transaction.admission_id, { relations: ['room', 'room.category'] }) : null;

			transaction.cashier = await getStaff(transaction.createdBy);
		}

		return {
			result: transactions,
			lastPage: Math.ceil(total / options.limit),
			itemsPerPage: options.limit,
			totalPages: total,
			currentPage: options.page,
		};
	}

	async fetchPending(options: PaginationOptionsInterface, params): Promise<any> {
		const { startDate, endDate, patient_id, bill_source, fetch } = params;

		const query = this.transactionsRepository.createQueryBuilder('q').select('q.*')
			.where('q.payment_type = :type', { type: 'self' });

		query.where(new Brackets(qb => {
			qb.where('q.status = 0').orWhere('q.status = -1');
		}));

		if (startDate && startDate !== '') {
			const start = moment(startDate).endOf('day').toISOString();
			query.andWhere(`q.createdAt >= '${start}'`);
		}
		if (endDate && endDate !== '') {
			const end = moment(endDate).endOf('day').toISOString();
			query.andWhere(`q.createdAt <= '${end}'`);
		}

		if (patient_id && patient_id !== '') {
			query.andWhere('q.patient_id = :patient_id', { patient_id });
		}

		if (bill_source && bill_source !== '') {
			query.where('q.bill_source = :type', { type: bill_source });
		}

		const allTransactions = fetch && fetch === '1' ? await query.getRawMany() : [];

		const page = options.page - 1;

		const transactions = await query.offset(page * options.limit)
			.limit(options.limit)
			.orderBy('q.createdAt', 'DESC')
			.getRawMany();

		const total = await query.getCount();

		for (const transaction of transactions) {

			if (transaction.patient_id) {
				transaction.patient = await this.patientRepository.findOne(transaction.patient_id);
			}

			if (transaction.service_cost_id) {
				transaction.service = await this.serviceCostRepository.findOne(transaction.service_cost_id);
			}

			if (transaction.patient_request_item_id) {
				transaction.patientRequestItem = await this.patientRequestItemRepository.findOne(transaction.patient_request_item_id, { relations: ['request'] });
			}

			transaction.admission = transaction.admission_id ? await this.admissionRepository.findOne(transaction.admission_id, { relations: ['room', 'room.category'] }) : null;

			transaction.cashier = await getStaff(transaction.createdBy);
		}

		return {
			result: transactions,
			lastPage: Math.ceil(total / options.limit),
			itemsPerPage: options.limit,
			totalPages: total,
			currentPage: options.page,
			all: allTransactions.map(t => ({ id: t.id, amount: t.amount })),
		};
	}

	async saveRequest(params: any, username: string): Promise<any> {
		try {
			const { patient_id, items } = params;

			const patient = await this.patientRepository.findOne(patient_id, { relations: ['hmo'] });

			let transactions = [];
			for (const item of items) {
				if (item.code && item.code !== '') {
					const serialCode = await getSerialCode(item.category);
					const nextId = `00000${serialCode}`;
					const code = `${item.category.toUpperCase().substring(0, 1)}R${moment().format('YY')}/${moment().format('MM')}/${nextId.slice(-5)}`;

					const hmo = patient.hmo;

					const data = {
						code,
						serial_code: serialCode,
						patient,
						requestType: item.category,
						requestNote: '',
						urgent: false,
						createdBy: username,
					};

					const request = await this.patientRequestRepository.save(data);

					let serviceCost = await getConnection().getRepository(ServiceCost).findOne({
						where: { code: item.code, hmo },
					});
					if (!serviceCost) {
						serviceCost = await createServiceCost(item.code, hmo);
					}

					const _requestItem = {
						request,
						service: serviceCost.item,
						createdBy: username,
					};
					const requestItem = await this.patientRequestItemRepository.save(_requestItem);

					const transactionCreditDto: TransactionCreditDto = {
						patient_id: patient.id,
						username,
						sub_total: 0,
						vat: 0,
						amount: (serviceCost?.tariff || 0) * -1,
						voucher_amount: 0,
						amount_paid: 0,
						change: 0,
						description: `Payment for ${item.category}`,
						payment_method: null,
						part_payment_expiry_date: null,
						bill_source: item.category,
						next_location: null,
						status: 0,
						hmo_approval_code: null,
						transaction_details: null,
						admission_id: null,
						nicu_id: null,
						staff_id: null,
						lastChangedBy: null,
					};

					const payment = await postDebit(transactionCreditDto, serviceCost, null, requestItem, null, hmo);

					const rqItem = await getConnection().getRepository(PatientRequestItem).findOne(requestItem.id);
					rqItem.transaction = await getConnection().getRepository(Transaction).findOne(payment.id);
					await rqItem.save();

					transactions = [...transactions, payment];
				}
			}

			return { success: true, transactions };
		} catch (error) {
			console.log(error);
			return { success: false, message: error.message };
		}
	}

	async processTransaction(id: number, transactionDto: ProcessTransactionDto, updatedBy): Promise<any> {
		const queryRunner = getConnection().createQueryRunner();
		await queryRunner.startTransaction();

		const { voucher_id, amount_paid, voucher_amount, payment_method, patient_id, is_part_payment } = transactionDto;
		try {
			const transaction = await this.transactionsRepository.findOne(id, { relations: ['patient', 'staff', 'appointment', 'hmo', 'admission', 'nicu'] });

			const amount = Math.abs(transaction.amount);

			let data: TransactionCreditDto = {
				patient_id,
				username: updatedBy,
				sub_total: 0,
				vat: 0,
				amount: Math.abs(amount_paid),
				voucher_amount: 0,
				amount_paid,
				change: 0,
				description: transaction.description,
				payment_method,
				part_payment_expiry_date: null,
				bill_source: transaction.bill_source,
				next_location: null,
				status: 1,
				hmo_approval_code: null,
				transaction_details: null,
				admission_id: transaction.admission?.id || null,
				nicu_id: transaction.nicu?.id || null,
				staff_id: transaction.staff?.id || null,
				lastChangedBy: updatedBy,
			};

			let voucher = null;
			if (payment_method === 'Voucher') {
				voucher = await this.voucherRepository.findOne(voucher_id, { relations: ['patient'] });

				if (voucher.patient.id !== patient_id) {
					return { success: false, message: 'invalid voucher code' };
				} else if (!voucher.isActive) {
					return { success: false, message: 'voucher code has been used' };
				}

				data = { ...data, voucher_amount };

				voucher.amount_used = voucher_amount;
				voucher.isActive = false;
				await voucher.save();
			}

			let queue: Queue;
			let appointment = null;
			if (transaction.next_location && transaction.next_location === 'vitals') {
				// find appointment
				console.log(transaction.id);
				appointment = await this.appointmentRepository.findOne({
					where: { transaction: transaction.id },
					relations: ['patient', 'whomToSee', 'consultingRoom', 'serviceCategory'],
				});

				if (!appointment) {
					return { success: false, message: 'Cannot find appointment' };
				}

				appointment.status = 'Approved';
				appointment.save();
				console.log(appointment);

				// create new queue
				queue = await this.queueSystemRepository.saveQueue(appointment, transaction.next_location, appointment.patient);
				this.appGateway.server.emit('nursing-queue', { queue });
			}

			if (is_part_payment && is_part_payment === 1) {
				transaction.amount = Math.abs(amount_paid) * -1;
			}

			transaction.next_location = null;
			transaction.status = 1;
			transaction.lastChangedBy = updatedBy;
			const rs = await transaction.save();

			const credit = await postCredit(data, transaction.service, voucher, transaction.patientRequestItem, appointment, transaction.hmo);

			let balancePayment: Transaction;
			if (is_part_payment && is_part_payment === 1) {
				const duration = await getConnection().getRepository(Settings).findOne({ where: { slug: 'part-payment-duration' } });
				const date = moment().add(duration.value, 'd').format('YYYY-MM-DD');

				const value: TransactionCreditDto = {
					patient_id: transaction.patient?.id || null,
					username: transaction.createdBy,
					sub_total: 0,
					vat: 0,
					amount: (amount - amount_paid) * -1,
					voucher_amount: 0,
					amount_paid,
					change: 0,
					description: transaction.description,
					payment_method,
					part_payment_expiry_date: date,
					bill_source: transaction.bill_source,
					next_location: transaction.next_location,
					status: -1,
					hmo_approval_code: transaction.hmo_approval_code,
					transaction_details: transaction.transaction_details,
					admission_id: transaction.admission?.id || null,
					nicu_id: transaction.nicu?.id || null,
					staff_id: transaction.staff?.id || null,
					lastChangedBy: updatedBy,
				};

				balancePayment = await postDebit(value, transaction.service, null, transaction.patientRequestItem, transaction.appointment, transaction.hmo);
			}

			await queryRunner.commitTransaction();
			await queryRunner.release();

			const creditTransaction = await this.transactionsRepository.findOne(credit.id, {
				relations: ['patient', 'staff', 'appointment', 'hmo', 'admission', 'patientRequestItem'],
			});
			const cashier = await getStaff(credit.createdBy);
			if (creditTransaction.patientRequestItem) {
				transaction.patientRequestItem = await this.patientRequestItemRepository.findOne(transaction.patientRequestItem.id, { relations: ['request'] });
			}

			rs.staff = await getStaff(transaction.lastChangedBy);

			return { success: true, transaction: rs, credit: { ...creditTransaction, cashier }, queue, balancePayment };
		} catch (error) {
			await queryRunner.rollbackTransaction();
			await queryRunner.release();
			console.log(error);
			return { success: false, message: error.message };
		}
	}

	async processBulkTransaction(transactionDto: ProcessTransactionDto, username: string): Promise<any> {
		const { payment_method, items, patient_id, amount_paid, is_part_payment, partAmount } = transactionDto;
		try {
			let transactions = [];
			for (const item of items) {
				const transaction = await this.transactionsRepository.findOne(item.id, { relations: ['patient', 'staff', 'appointment', 'hmo', 'admission', 'nicu'] });

				const data: TransactionCreditDto = {
					patient_id: transaction.patient.id,
					username,
					sub_total: 0,
					vat: 0,
					amount: Math.abs(item.amount),
					voucher_amount: 0,
					amount_paid: 0,
					change: 0,
					description: transaction.description,
					payment_method,
					part_payment_expiry_date: null,
					bill_source: transaction.bill_source,
					next_location: null,
					status: 1,
					hmo_approval_code: null,
					transaction_details: null,
					admission_id: transaction.admission?.id || null,
					nicu_id: transaction.nicu?.id || null,
					staff_id: transaction.staff?.id || null,
					lastChangedBy: username,
				};

				let queue: Queue;
				let appointment = null;
				if (transaction.next_location && transaction.next_location === 'vitals') {
					// find appointment
					appointment = await this.appointmentRepository.findOne({
						where: { transaction: transaction.id },
						relations: ['patient', 'whomToSee', 'consultingRoom', 'serviceCategory'],
					});

					// create new queue
					if (appointment) {
						appointment.status = 'Approved';
						appointment.save();

						queue = await this.queueSystemRepository.saveQueue(appointment, transaction.next_location);
						this.appGateway.server.emit('nursing-queue', { queue });
					}
				}

				await postCredit(data, transaction.service, null, transaction.patientRequestItem, appointment, transaction.hmo);

				transaction.next_location = null;
				transaction.status = 1;
				transaction.lastChangedBy = username;
				const rs = await transaction.save();

				rs.staff = await getStaff(transaction.lastChangedBy);

				transactions = [...transactions, rs];
			}

			const patient = await this.patientRepository.findOne(patient_id, { relations: ['staff'] });

			const admission = await getConnection().getRepository(Admission).findOne({
				where: { patient, status: 0 },
			});

			const nicu = await getConnection().getRepository(Nicu).findOne({
				where: { patient, status: 0 },
			});

			let balancePayment: Transaction;
			if (is_part_payment && is_part_payment === 1) {
				const duration = await getConnection().getRepository(Settings).findOne({ where: { slug: 'part-payment-duration' } });
				const date = moment().add(duration.value, 'd').format('YYYY-MM-DD');

				const value: TransactionCreditDto = {
					patient_id,
					username,
					sub_total: 0,
					vat: 0,
					amount: (amount_paid - partAmount) * -1,
					voucher_amount: 0,
					amount_paid,
					change: 0,
					description: null,
					payment_method,
					part_payment_expiry_date: date,
					bill_source: 'debit',
					next_location: null,
					status: -1,
					hmo_approval_code: null,
					transaction_details: null,
					admission_id: admission?.id || null,
					nicu_id: nicu?.id || null,
					staff_id: patient.staff?.id || null,
					lastChangedBy: username,
				};

				balancePayment = await postDebit(value, null, null, null, null, patient.hmo);
			}

			return { success: true, transactions, balancePayment };
		} catch (error) {
			console.log(error);
			return { success: false, message: error.message };
		}
	}

	async creditAccount(params, createdBy: string): Promise<any> {
		try {
			const { patient_id, amount, payment_method } = params;

			const patient = await this.patientRepository.findOne(patient_id, { relations: ['hmo'] });

			const data: TransactionCreditDto = {
				patient_id,
				username: createdBy,
				sub_total: 0,
				vat: 0,
				amount: Math.abs(amount),
				voucher_amount: 0,
				amount_paid: 0,
				change: 0,
				description: 'credit account',
				payment_method: payment_method || 'Cash',
				part_payment_expiry_date: null,
				bill_source: 'credit-deposit',
				next_location: null,
				status: 1,
				hmo_approval_code: null,
				transaction_details: null,
				admission_id: null,
				nicu_id: null,
				staff_id: null,
				lastChangedBy: null,
			};

			const rs = await postCredit(data, null, null, null, null, patient.hmo);

			await getConnection().getRepository(AccountDeposit).save({ patient, amount: Math.abs(amount), transaction: rs });

			const balance = await getDepositBalance(patient_id, true);

			return { success: true, balance };
		} catch (error) {
			console.log(error);
			return { success: false, message: error.message };
		}
	}

	async processCreditTransaction(transactionDto: ProcessTransactionDto, updatedBy): Promise<any> {
		const { payment_method, items } = transactionDto;
		try {
			let transactions = [];
			for (const item of items) {
				const transaction = await this.transactionsRepository.findOne(item.id, { relations: ['patient', 'staff', 'appointment', 'hmo', 'admission', 'nicu'] });

				const data: TransactionCreditDto = {
					patient_id: transaction.patient.id,
					username: updatedBy,
					sub_total: 0,
					vat: 0,
					amount: Math.abs(item.amount),
					voucher_amount: 0,
					amount_paid: 0,
					change: 0,
					description: transaction.description,
					payment_method,
					part_payment_expiry_date: null,
					bill_source: transaction.bill_source,
					next_location: null,
					status: 1,
					hmo_approval_code: null,
					transaction_details: null,
					admission_id: transaction.admission?.id || null,
					nicu_id: transaction.nicu?.id || null,
					staff_id: transaction.staff?.id || null,
					lastChangedBy: updatedBy,
				};

				let queue;
				let appointment = null;
				if (transaction.next_location && transaction.next_location === 'vitals') {
					// find appointment
					appointment = await this.appointmentRepository.findOne({
						where: { transaction: transaction.id },
						relations: ['patient', 'whomToSee', 'consultingRoom', 'serviceCategory'],
					});

					// create new queue
					if (appointment) {
						appointment.status = 'Approved';
						appointment.save();

						queue = await this.queueSystemRepository.saveQueue(appointment, transaction.next_location);
						this.appGateway.server.emit('nursing-queue', { queue });
					}
				}

				const credit = await postCredit(data, transaction.service, null, transaction.patientRequestItem, appointment, transaction.hmo);

				await getConnection().getRepository(AccountDeposit).save({
					patient: transaction.patient,
					amount: Math.abs(item.amount) * -1,
					transaction: credit,
				});

				transaction.next_location = null;
				transaction.status = 1;
				transaction.lastChangedBy = updatedBy;
				const rs = await transaction.save();

				rs.staff = await getStaff(transaction.lastChangedBy);

				transactions = [...transactions, rs];
			}

			return { success: true, transactions };
		} catch (error) {
			console.log(error);
			return { success: false, message: error.message };
		}
	}

	async transfer(id: number, createdBy): Promise<any> {
		const transaction = await this.transactionsRepository.findOne(id);

		const hmo = await this.hmoSchemeRepository.findOne({ where: { name: 'Private' } });

		const serviceCost = await this.serviceCostRepository.findOne({
			where: {
				code: transaction.service.code,
				hmo,
			},
		});

		transaction.payment_type = 'self';
		transaction.amount = serviceCost.tariff * -1;
		transaction.transaction_details = { ...transaction.transaction_details, amount: serviceCost.tariff };
		transaction.hmo = hmo;
		transaction.lastChangedBy = createdBy;
		const rs = await transaction.save();

		return { success: true, transaction: rs };
	}

	async approve(id: number, createdBy): Promise<any> {
		const transaction = await this.transactionsRepository.findOne(id, { relations: ['patient', 'staff', 'appointment', 'hmo', 'admission', 'nicu'] });

		const appointment = await this.appointmentRepository.findOne({
			where: { transaction },
			relations: ['patient'],
		});
		if (appointment) {
			appointment.status = 'Approved';
			appointment.lastChangedBy = createdBy;
			await appointment.save();

			const queue = await this.queueSystemRepository.saveQueue(appointment, transaction.next_location, appointment.patient);
			this.appGateway.server.emit('nursing-queue', { queue });
		}

		const data: TransactionCreditDto = {
			patient_id: transaction.patient.id,
			username: createdBy,
			sub_total: 0,
			vat: 0,
			amount: Math.abs(transaction.amount),
			voucher_amount: 0,
			amount_paid: 0,
			change: 0,
			description: transaction.description,
			payment_method: 'HMO',
			part_payment_expiry_date: null,
			bill_source: transaction.bill_source,
			next_location: null,
			status: 1,
			hmo_approval_code: null,
			transaction_details: null,
			admission_id: transaction.admission?.id || null,
			nicu_id: transaction.nicu?.id || null,
			staff_id: transaction.staff?.id || null,
			lastChangedBy: createdBy,
		};

		await postCredit(data, transaction.service, null, transaction.patientRequestItem, appointment, transaction.hmo);

		transaction.status = 1;
		transaction.payment_method = 'HMO';
		transaction.lastChangedBy = createdBy;
		const rs = await transaction.save();

		return { success: true, transaction: rs };
	}

	async payWithHmoCode(id: string, { hmo_approval_code }, createdBy): Promise<any> {
		const transaction = await this.transactionsRepository.findOne(id, { relations: ['patient', 'staff', 'appointment', 'hmo', 'admission', 'nicu'] });

		const appointment = await this.appointmentRepository.findOne({
			where: { transaction },
			relations: ['patient'],
		});
		if (appointment) {
			appointment.status = 'Approved';
			appointment.lastChangedBy = createdBy;
			await appointment.save();

			const queue = await this.queueSystemRepository.saveQueue(appointment, transaction.next_location, appointment.patient);
			this.appGateway.server.emit('nursing-queue', { queue });
		}

		const data: TransactionCreditDto = {
			patient_id: transaction.patient.id,
			username: createdBy,
			sub_total: 0,
			vat: 0,
			amount: Math.abs(transaction.amount),
			voucher_amount: 0,
			amount_paid: 0,
			change: 0,
			description: transaction.description,
			payment_method: 'HMO',
			part_payment_expiry_date: null,
			bill_source: transaction.bill_source,
			next_location: null,
			status: 1,
			hmo_approval_code,
			transaction_details: null,
			admission_id: transaction.admission?.id || null,
			nicu_id: transaction.nicu?.id || null,
			staff_id: transaction.staff?.id || null,
			lastChangedBy: createdBy,
		};

		await postCredit(data, transaction.service, null, transaction.patientRequestItem, appointment, transaction.hmo);

		transaction.hmo_approval_code = hmo_approval_code;
		transaction.status = 1;
		transaction.payment_method = 'HMO';
		transaction.lastChangedBy = createdBy;
		await transaction.save();

		return { success: true, transaction };
	}

	async deleteTransaction(id: number, username: string): Promise<any> {
		const transaction = await this.transactionsRepository.findOne(id);

		if (!transaction) {
			throw new NotFoundException(`Transaction with ID '${id}' not found`);
		}
		transaction.deletedBy = username;
		await transaction.save();

		return transaction.softRemove();
	}
}
