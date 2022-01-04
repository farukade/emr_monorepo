import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../auth/entities/user.entity';
import { StaffDetails } from '../../hr/staff/entities/staff_details.entity';
import * as moment from 'moment';
import { PatientRequestHelper } from '../../../common/utils/PatientRequestHelper';
import { RequestPaymentHelper } from '../../../common/utils/RequestPaymentHelper';
import { PatientRequestRepository } from '../repositories/patient_request.repository';
import { PatientRequestItemRepository } from '../repositories/patient_request_items.repository';
import { PatientRepository } from '../repositories/patient.repository';
import { TransactionsRepository } from '../../finance/transactions/transactions.repository';
import { AppGateway } from '../../../app.gateway';
import { getConnection } from 'typeorm';
import { Transaction } from '../../finance/transactions/transaction.entity';
import { formatPID, generatePDF, getStaff, postDebit } from '../../../common/utils/utils';
import { AdmissionsRepository } from '../admissions/repositories/admissions.repository';
import * as path from 'path';
import { Drug } from '../../inventory/entities/drug.entity';
import { DrugBatch } from '../../inventory/entities/batches.entity';
import { HmoSchemeRepository } from '../../hmo/repositories/hmo_scheme.repository';
import { DrugRepository } from '../../inventory/pharmacy/drug/drug.repository';
import { Admission } from '../admissions/entities/admission.entity';
import { AdmissionClinicalTask } from '../admissions/entities/admission-clinical-task.entity';
import { TransactionCreditDto } from '../../finance/transactions/dto/transaction-credit.dto';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { DrugGeneric } from '../../inventory/entities/drug_generic.entity';
import { PatientRequestItem } from '../entities/patient_request_items.entity';

@Injectable()
export class PatientRequestService {
	constructor(
		private readonly appGateway: AppGateway,
		@InjectRepository(PatientRequestRepository)
		private patientRequestRepository: PatientRequestRepository,
		@InjectRepository(HmoSchemeRepository)
		private hmoSchemeRepository: HmoSchemeRepository,
		@InjectRepository(PatientRequestItemRepository)
		private patientRequestItemRepository: PatientRequestItemRepository,
		@InjectRepository(PatientRepository)
		private patientRepository: PatientRepository,
		@InjectRepository(TransactionsRepository)
		private transactionsRepository: TransactionsRepository,
		@InjectRepository(AdmissionsRepository)
		private admissionRepository: AdmissionsRepository,
		@InjectRepository(DrugRepository)
		private drugRepository: DrugRepository,
	) {

	}

	async listRequests(requestType, urlParams): Promise<any> {
		const { startDate, endDate, status, page, limit, today, item_id, type, patient_id } = urlParams;

		const queryLimit = limit ? parseInt(limit, 10) : 30;
		const offset = (page ? parseInt(page, 10) : 1) - 1;

		const query = this.patientRequestRepository.createQueryBuilder('q')
			.leftJoin('q.patient', 'patient')
			.leftJoin(User, 'creator', 'q.createdBy = creator.username')
			.innerJoin(StaffDetails, 'staff1', 'staff1.user_id = creator.id')
			.select('q.id, q.requestType, q.code, q.createdAt, q.status, q.urgent, q.requestNote')
			.addSelect('CONCAT(staff1.first_name || \' \' || staff1.last_name) as created_by, staff1.id as created_by_id')
			.addSelect('CONCAT(patient.other_names || \' \' || patient.surname) as patient_name, patient.id as patient_id')
			.where('q.requestType = :requestType', { requestType });

		if (startDate && startDate !== '') {
			const start = moment(startDate).startOf('day').format('YYYY-MM-DD HH:mm:ss');
			query.andWhere(`q.createdAt >= '${start}'`);
		}

		if (endDate && endDate !== '') {
			const end = moment(endDate).endOf('day').format('YYYY-MM-DD HH:mm:ss');
			query.andWhere(`q.createdAt <= '${end}'`);
		}

		if (today && today !== '') {
			query.andWhere(`CAST(q.createdAt as text) LIKE '%${today}%'`);
		}

		if (status === 'Completed') {
			query.andWhere('q.status = :status', { status: 1 });
		}

		if (type && type === 'admission') {
			query.andWhere('q.admission_id = :item_id', { item_id });
		}

		if (type && type === 'procedure') {
			query.andWhere('q.procedure_id = :item_id', { item_id });
		}

		if (type && type === 'antenatal') {
			query.andWhere('q.antenatal_id = :item_id', { item_id });
		}

		if (type && type === 'ivf') {
			query.andWhere('q.ivf_id = :item_id', { item_id });
		}

		if (patient_id && patient_id !== '') {
			query.andWhere('q.patient_id = :patient_id', { patient_id });
		}

		const count = await query.getCount();

		const items = await query.orderBy({
			'q.urgent': 'DESC',
			'q.createdAt': 'DESC',
		}).limit(queryLimit).offset(offset * queryLimit).getRawMany();

		let result = [];
		for (const req of items) {
			const request = await this.patientRequestRepository.findOne({ where: { id: req.id }, relations: ['item'] });

			const transaction = await this.transactionsRepository.findOne({
				where: { patientRequestItem: request.item },
			});

			let drug;
			if (request.item.drug) {
				drug = await this.drugRepository.findOne({
					where: { id: request.item.drug.id },
					relations: ['batches'],
				});
			}
			const reqItem = { ...request.item, drug, transaction };
			const theRequest = { ...request, item: reqItem };

			const patient = await this.patientRepository.findOne(req.patient_id, {
				relations: ['nextOfKin', 'immunization', 'hmo'],
			});

			result = [...result, { ...req, ...theRequest, patient }];
		}

		return {
			result,
			lastPage: Math.ceil(count / queryLimit),
			itemsPerPage: queryLimit,
			totalPages: count,
			currentPage: page,
		};
	}

	drugsQuery(patient_id, startDate, endDate, today, type, item_id, status) {
		const query = this.patientRequestRepository.createQueryBuilder('q')
			.select(['q.group_code as group_code', 'max(q.createdAt) AS created_at', 'max(q.patient_id) as patient_id', 'max(q.status) as status'])
			.groupBy('q.group_code')
			.where('q.requestType = :requestType', { requestType: 'drugs' });

		if (patient_id && patient_id !== '') {
			query.andWhere('q.patient_id = :patient_id', { patient_id });
		}

		if (startDate && startDate !== '') {
			const start = moment(startDate).startOf('day').format('YYYY-MM-DD HH:mm:ss');
			query.andWhere(`q.createdAt >= '${start}'`);
		}

		if (endDate && endDate !== '') {
			const end = moment(endDate).endOf('day').format('YYYY-MM-DD HH:mm:ss');
			query.andWhere(`q.createdAt <= '${end}'`);
		}

		if (today && today !== '') {
			query.andWhere(`CAST(q.createdAt as text) LIKE '%${today}%'`);
		}

		if (status && status !== '') {
			if (status === 'Open') {
				query.andWhere('q.status = :status', { status: 0 });
			} else if (status === 'Filled') {
				query.andWhere('q.status = :status', { status: 0 });
			} else if (status === 'Completed') {
				query.andWhere('q.status = :status', { status: 1 });
			}
		}

		if (type && type === 'admission') {
			query.andWhere('q.admission_id = :item_id', { item_id });
		}

		if (type && type === 'procedure') {
			query.andWhere('q.procedure_id = :item_id', { item_id });
		}

		if (type && type === 'antenatal') {
			query.andWhere('q.antenatal_id = :item_id', { item_id });
		}

		if (type && type === 'ivf') {
			query.andWhere('q.ivf_id = :item_id', { item_id });
		}

		return query;
	}

	async fetchRequests(options: PaginationOptionsInterface, urlParams): Promise<Pagination> {
		try {
			const { startDate, endDate, status, today, item_id, type, patient_id } = urlParams;

			const page = options.page - 1;

			const items = await this.drugsQuery(patient_id, startDate, endDate, today, type, item_id, status)
				.offset(page * options.limit)
				.limit(options.limit)
				.orderBy('created_at', 'DESC')
				.getRawMany();

			const results = await this.drugsQuery(patient_id, startDate, endDate, today, type, item_id, status).getRawMany();
			const total = results.length;

			let result = [];
			for (const req of items) {
				const requests = await this.patientRequestRepository.find({
					where: { code: req.group_code },
					relations: ['item'],
				});

				let allRequests = [];
				for (const request of requests) {
					const transaction = await this.transactionsRepository.findOne({
						where: { patientRequestItem: request.item },
					});

					let drug;
					if (request.item.drug) {
						drug = await this.drugRepository.findOne({
							where: { id: request.item.drug.id },
							relations: ['batches'],
						});
					}

					const reqItem = { ...request.item, drug, transaction };
					allRequests = [...allRequests, { ...request, item: reqItem }];
				}

				const patient = await this.patientRepository.findOne(req.patient_id, {
					relations: ['nextOfKin', 'immunization', 'hmo'],
				});

				const patientReq = allRequests[0];
				const hasPaid = allRequests.find(r => r.item?.transaction?.status === 1);
				result = [...result, {
					...req,
					id: patientReq.id,
					created_by: patientReq.createdBy,
					requestNote: patientReq.requestNote,
					filled: patientReq.item.filled,
					filled_by: patientReq.item.filledBy,
					transaction_status: hasPaid ? 1 : 0,
					patient,
					requests: allRequests,
				}];
			}

			return {
				result,
				lastPage: Math.ceil(total / options.limit),
				itemsPerPage: options.limit,
				totalPages: total,
				currentPage: options.page,
			};
		} catch (e) {
			console.log(e);
			throw e;
		}
	}

	async listPatientRequests(requestType, patient_id, urlParams): Promise<any> {
		const { startDate, endDate, filled, page, limit, today, item_id, type } = urlParams;

		const queryLimit = limit ? parseInt(limit, 10) : 30;
		const offset = (page ? parseInt(page, 10) : 1) - 1;

		const query = this.patientRequestRepository.createQueryBuilder('q')
			.select('q.*')
			.where('q.patient_id = :patient_id', { patient_id })
			.andWhere('q.requestType = :requestType', { requestType });

		if (startDate && startDate !== '') {
			const start = moment(startDate).startOf('day').format('YYYY-MM-DD HH:mm:ss');
			query.andWhere(`q.createdAt >= '${start}'`);
		}

		if (endDate && endDate !== '') {
			const end = moment(endDate).endOf('day').format('YYYY-MM-DD HH:mm:ss');
			query.andWhere(`q.createdAt <= '${end}'`);
		}

		if (today && today !== '') {
			query.andWhere(`CAST(q.createdAt as text) LIKE '%${today}%'`);
		}

		if (type && type === 'admission') {
			query.andWhere('q.admission_id = :item_id', { item_id });
		}

		if (type && type === 'procedure') {
			query.andWhere('q.procedure_id = :item_id', { item_id });
		}

		if (type && type === 'antenatal') {
			query.andWhere('q.antenatal_id = :item_id', { item_id });
		}

		if (type && type === 'ivf') {
			query.andWhere('q.ivf_id = :item_id', { item_id });
		}

		const count = await query.getCount();

		const items = await query.orderBy({
			'q.urgent': 'DESC',
			'q.createdAt': 'DESC',
		}).limit(queryLimit).offset(offset * queryLimit).getRawMany();

		let result = [];
		for (const req of items) {
			const request = await this.patientRequestRepository.findOne({ where: { id: req.id }, relations: ['item'] });
			if (request.item) {
				const transaction = await this.transactionsRepository.findOne({
					where: { patientRequestItem: request.item },
				});

				let drug;
				if (request.item.drug) {
					drug = await this.drugRepository.findOne({
						where: { id: request.item.drug.id },
						relations: ['batches'],
					});
				}
				const reqItem = { ...request.item, drug, transaction };
				const theRequest = { ...request, item: reqItem };

				const patient = await this.patientRepository.findOne(req.patient_id, {
					relations: ['nextOfKin', 'immunization', 'hmo'],
				});

				result = [...result, { ...req, ...theRequest, patient }];
			}
		}

		return {
			result,
			lastPage: Math.ceil(count / queryLimit),
			itemsPerPage: queryLimit,
			totalPages: count,
			currentPage: page,
		};
	}

	async doSaveRequest(param, createdBy) {
		const { requestType, patient_id } = param;
		if (!requestType && requestType === '') {
			return { success: false, message: 'Request Type cannot be empty' };
		}
		let res = {};
		const patient = await this.patientRepository.findOne(patient_id, { relations: ['hmo'] });
		switch (requestType) {
			case 'labs':
				// save request
				let labRequest = await PatientRequestHelper.handleLabRequest(param, patient, createdBy);
				if (labRequest.success) {
					// save transaction
					const payment = await RequestPaymentHelper.clinicalLabPayment(labRequest.data, patient, createdBy, param.pay_later);
					// @ts-ignore
					labRequest = { ...payment.labRequest };

					this.appGateway.server.emit('paypoint-queue', { payment: payment.transactions });
				}
				res = labRequest;
				break;
			case 'drugs':
				res = await PatientRequestHelper.handlePharmacyRequest(param, patient, createdBy);
				break;
			case 'scans':
				let request = await PatientRequestHelper.handleServiceRequest(param, patient, createdBy, requestType);
				if (request.success) {
					// save transaction
					const payment = await RequestPaymentHelper.servicePayment(request.data, patient, createdBy, requestType, param.pay_later);

					// @ts-ignore
					request = { ...payment.request };

					this.appGateway.server.emit('paypoint-queue', { payment: payment.transactions });
				}
				res = request;
				break;
			case 'procedure':
				let procedure = await PatientRequestHelper.handleServiceRequest(param, patient, createdBy, requestType);
				if (procedure.success) {
					// save transaction
					const payment = await RequestPaymentHelper.servicePayment(procedure.data, patient, createdBy, requestType, param.bill);

					// @ts-ignore
					procedure = { ...payment.request };

					this.appGateway.server.emit('paypoint-queue', { payment: payment.transactions });
				}
				res = procedure;
				break;

			case 'vaccines':
				res = await PatientRequestHelper.handleVaccinationRequest(param, patient, createdBy);
				break;
			default:
				res = { success: false, message: 'No data' };
				break;
		}
		return res;
	}

	async switchRequest(id: number, param, username) {
		try {
			const { dose_quantity, frequency, frequencyType, duration } = param;

			const item = await this.patientRequestItemRepository.findOne(id);

			const generic = param.generic ? await getConnection().getRepository(DrugGeneric).findOne(param.generic?.id) : null;
			let drug = param.drug ? await getConnection().getRepository(Drug).findOne(param.drug?.id) : null;

			item.drug = drug;
			item.drugGeneric = generic;
			item.doseQuantity = dose_quantity;
			item.frequency = frequency;
			item.frequencyType = frequencyType;
			item.duration = duration;
			item.lastChangedBy = username;

			const rs = await item.save();

			if (drug) {
				drug = await this.drugRepository.findOne({
					where: { id: drug.id },
					relations: ['batches'],
				});
			}

			return { success: true, data: { ...rs, drug } };
		} catch (error) {
			console.log(error);
			return { success: false, message: error.message };
		}
	}

	async receiveSpecimen(id: number, username: string) {
		try {
			const request = await this.patientRequestRepository.findOne(id, { relations: ['item'] });

			const item = await this.patientRequestItemRepository.findOne(request.item.id);
			item.received = 1;
			item.receivedBy = username;
			item.receivedAt = moment().format('YYYY-MM-DD HH:mm:ss');
			item.lastChangedBy = username;
			const rs = await item.save();

			return { success: true, data: rs };
		} catch (e) {
			return { success: false, message: e.message };
		}
	}

	async doFillRequest(param, id, updatedBy, fill: boolean) {
		const { patient_id, items, code } = param;
		try {
			const patient = await this.patientRepository.findOne(patient_id, {
				relations: ['nextOfKin', 'immunization', 'hmo'],
			});

			let results = [];

			if (fill) {
				for (const reqItem of items) {
					const batch = await getConnection().getRepository(DrugBatch).findOne(reqItem.item.drugBatch.id);
					batch.quantity = batch.quantity - parseInt(reqItem.item.fillQuantity, 10);
					await batch.save();

					const drug = await getConnection().getRepository(Drug).findOne(reqItem.item.drug.id);
					const requestItem = await this.patientRequestItemRepository.findOne(reqItem.item.id);

					requestItem.drugBatch = batch;
					requestItem.drugGeneric = drug.generic;
					requestItem.filled = 1;
					requestItem.fillQuantity = reqItem.item.fillQuantity;
					requestItem.filledAt = moment().format('YYYY-MM-DD HH:mm:ss');
					requestItem.filledBy = updatedBy;
					requestItem.drug = drug;
					const rs = await requestItem.save();

					const amount = batch.unitPrice * parseInt(reqItem.item.fillQuantity, 10);

					const admission = await getConnection().getRepository(Admission).findOne({ where: { patient } });

					// save transaction
					const data: TransactionCreditDto = {
						patient_id: patient.id,
						username: updatedBy,
						sub_total: 0,
						vat: 0,
						amount: amount * -1,
						voucher_amount: 0,
						amount_paid: 0,
						change: 0,
						description: 'Payment for pharmacy request',
						payment_method: null,
						part_payment_expiry_date: null,
						bill_source: 'drugs',
						next_location: null,
						status: 0,
						hmo_approval_code: null,
						transaction_details: null,
						admission_id: admission?.id || null,
						staff_id: null,
						lastChangedBy: null,
					};

					const transaction = await postDebit(data, null, null, requestItem, null, patient.hmo);

					const _requestItem = await this.patientRequestItemRepository.findOne(reqItem.item.id);
					_requestItem.transaction = transaction;
					await _requestItem.save();

					this.appGateway.server.emit('paypoint-queue', transaction);

					results = [...results, { ...rs, transaction }];
				}
			} else {
				for (const reqItem of items) {
					const batch = await getConnection().getRepository(DrugBatch).findOne(reqItem.item.drugBatch.id);
					batch.quantity = batch.quantity + reqItem.item.fillQuantity;
					await batch.save();

					const item = await this.patientRequestItemRepository.findOne(reqItem.item.id);

					item.drugBatch = null;
					item.filled = 0;
					item.fillQuantity = 0;
					item.filledAt = null;
					item.filledBy = null;
					const rs = await item.save();

					const transaction = await this.transactionsRepository.findOne({
						where: { patientRequestItem: item },
					});
					if (transaction) {
						transaction.deletedBy = updatedBy;
						transaction.save();

						await transaction.softRemove();
					}

					const drug = await getConnection().getRepository(Drug).findOne(reqItem.item.drug.id, { relations: ['batches'] });

					results = [...results, { ...rs, drug }];
				}
			}

			return { success: true, data: results };
		} catch (e) {
			// console.log(e.message)
			return { success: false, message: e.message };
		}
	}

	async doApproveResult(id: number, params, body, username) {
		const { type } = params;
		const { code } = body;

		switch (type) {
			case 'labs':
			case 'scans':
				try {
					const request = await this.patientRequestRepository.findOne(id, { relations: ['item'] });

					const item = await this.patientRequestItemRepository.findOne(request.item.id);

					item.approved = 1;
					item.approvedBy = username;
					item.approvedAt = moment().format('YYYY-MM-DD HH:mm:ss');
					item.lastChangedBy = username;
					const rs = await item.save();

					request.status = 1;
					await request.save();

					return { success: true, data: rs };
				} catch (e) {
					return { success: false, message: e.message };
				}
			case 'drugs':
			default:
				try {
					const requests = await this.patientRequestRepository.find({
						where: { code },
						relations: ['item', 'patient'],
					});

					let resultItems = [];
					for (const reqItem of requests) {
						const requestItem = await this.patientRequestItemRepository.findOne(reqItem.item.id);

						requestItem.approved = 1;
						requestItem.approvedBy = username;
						requestItem.approvedAt = moment().format('YYYY-MM-DD HH:mm:ss');
						requestItem.lastChangedBy = username;
						const rs = await requestItem.save();

						resultItems = [...resultItems, rs];
					}

					for (const reqItem of requests) {
						const admission = await this.admissionRepository.findOne({ where: { patient: reqItem.patient } });

						// @ts-ignore
						const { vaccine } = reqItem.item;
						if (vaccine) {
							const newTask = new AdmissionClinicalTask();

							newTask.task = 'Immunization';
							newTask.title = `Give ${reqItem.item.drug.name} Immediately`;
							newTask.taskType = 'regimen';
							newTask.drug = { ...reqItem.item.drug, vaccine };
							newTask.dose = '1';
							newTask.interval = 1;
							newTask.intervalType = 'immediately';
							newTask.frequency = 'Immediately';
							newTask.taskCount = 1;
							newTask.startTime = moment().format('YYYY-MM-DD HH:mm:ss');
							newTask.nextTime = moment().format('YYYY-MM-DD HH:mm:ss');
							newTask.patient = reqItem.patient;
							newTask.admission = admission;
							newTask.createdBy = username;
							newTask.request = reqItem;

							await newTask.save();
						}

						reqItem.status = 1;
						reqItem.lastChangedBy = username;
						await reqItem.save();
					}

					return { success: true, data: resultItems };
				} catch (e) {
					return { success: false, message: e.message };
				}
		}
	}

	async fillResult(id: string, param, username: string) {
		try {
			const { parameters, note, result } = param;

			const request = await this.patientRequestRepository.findOne(id, { relations: ['item'] });

			const item = await this.patientRequestItemRepository.findOne(request.item.id);
			item.filled = 1;
			item.filledBy = username;
			item.filledAt = moment().format('YYYY-MM-DD HH:mm:ss');
			item.parameters = parameters;
			item.note = note;
			item.result = result;
			item.lastChangedBy = username;
			const rs = await item.save();

			return { success: true, data: rs };
		} catch (e) {
			return { success: false, message: e.message };
		}
	}

	async rejectResult(id: string, params, username: string) {
		try {
			const request = await this.patientRequestRepository.findOne(id, { relations: ['item'] });

			const item = await this.patientRequestItemRepository.findOne(request.item.id);
			item.filled = 0;
			item.filledBy = null;
			item.filledAt = null;
			item.parameters = item.parameters.map(p => ({
				...p,
				inference: '',
				value: '',
			}));
			item.result = null;
			item.lastChangedBy = username;

			if (params.type === 'scans') {
				item.document = null;
			}

			const rs = await item.save();

			return { success: true, data: rs };
		} catch (e) {
			return { success: false, message: e.message };
		}
	}

	async scheduleProcedure(id: number, params, username: string) {
		try {
			const { resources, start_date, end_date } = params;

			const request = await this.patientRequestRepository.findOne(id, { relations: ['item'] });

			const item = await this.patientRequestItemRepository.findOne(request.item.id);
			item.resources = resources;
			item.scheduledDate = true;
			item.scheduledStartDate = start_date;
			item.scheduledEndDate = end_date;
			item.lastChangedBy = username;
			const rs = await item.save();

			const transaction = await this.transactionsRepository.findOne({
				where: { patientRequestItem: item },
			});

			return { success: true, data: { ...rs, transaction } };
		} catch (e) {
			return { success: false, message: e.message };
		}
	}

	async startProcedure(id: number, params, username: string) {
		try {
			const { date } = params;

			const request = await this.patientRequestRepository.findOne(id, { relations: ['item'] });

			const item = await this.patientRequestItemRepository.findOne(request.item.id);
			item.startedDate = date;
			item.approved = 1;
			item.approvedBy = username;
			item.approvedAt = moment().format('YYYY-MM-DD HH:mm:ss');
			item.lastChangedBy = username;
			const rs = await item.save();

			request.status = 1;
			await request.save();

			const transaction = await this.transactionsRepository.findOne({
				where: { patientRequestItem: item },
			});

			return { success: true, data: { ...rs, transaction } };
		} catch (e) {
			return { success: false, message: e.message };
		}
	}

	async endProcedure(id: number, params, username: string) {
		try {
			const { date } = params;

			const request = await this.patientRequestRepository.findOne(id, { relations: ['item'] });

			const item = await this.patientRequestItemRepository.findOne(request.item.id);
			item.finishedDate = date;
			item.filled = 1;
			item.filledBy = username;
			item.filledAt = moment().format('YYYY-MM-DD HH:mm:ss');
			item.lastChangedBy = username;
			const rs = await item.save();

			const transaction = await this.transactionsRepository.findOne({
				where: { patientRequestItem: item },
			});

			return { success: true, data: { ...rs, transaction } };
		} catch (e) {
			return { success: false, message: e.message };
		}
	}

	async deleteRequest(id: string, params, username: string) {
		try {
			const { type } = params;
			const request = await this.patientRequestRepository.findOne(id, { relations: ['item'] });

			const item = await this.patientRequestItemRepository.findOne(request.item.id);

			item.cancelled = 1;
			item.cancelledBy = username;
			item.cancelledAt = moment().format('YYYY-MM-DD HH:mm:ss');
			item.lastChangedBy = username;
			item.deletedBy = username;
			const rs = await item.save();

			request.deletedBy = username;
			await request.save();

			try {
				const transaction = await this.transactionsRepository.findOne({ where: { patientRequestItem: item } });

				if (transaction && transaction.status === 1) {
					await this.transactionsRepository.save({
						...transaction,
						transaction_type: 'credit',
						balance: transaction.amount_paid,
						amount_paid: 0,
						status: 1,
					});
				}

				if (transaction) {
					transaction.deletedBy = username;
					await transaction.save();
					await transaction.softRemove();
				}
			} catch (e) {
				console.log(e);
			}

			await item.softRemove();

			await request.softRemove();

			return { success: true, data: rs };
		} catch (e) {
			return { success: false, message: 'could not remove request' };
		}
	}

	async printResult(id: number, params) {
		try {
			const { print_group, type } = params;

			const request = await this.patientRequestRepository.findOne(id, { relations: ['patient', 'item'] });

			const patient = await this.patientRepository.findOne(request.patient.id, { relations: ['hmo'] });

			// tslint:disable-next-line:prefer-const
			let results;
			const printGroup = parseInt(print_group, 10);
			if (printGroup === 1) {
				results = await this.patientRequestRepository.find({
					where: { code: request.code },
					relations: ['patient', 'item'],
				});
			} else {
				results = [request];
			}

			const date = new Date();
			const filename = `${type}-${date.getTime()}.pdf`;
			const filepath = path.resolve(__dirname, `../../../../public/result/${filename}`);

			const dob = moment(patient.date_of_birth, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD');

			const data = {
				patient,
				date: moment(request.createdAt, 'YYYY-MM-DD HH:mm:ss').format('DD-MMM-YYYY'),
				age: moment().diff(dob, 'years'),
				filepath,
				results,
				patient_id: formatPID(patient.id),
				logo: `${process.env.ENDPOINT}/public/images/logo.png`,
			};

			let content;
			switch (type) {
				case 'drugs':
					content = {
						...data,
						regimen_id: request.code,
						prescribed_by: await getStaff(results[0].createdBy),
					};

					await generatePDF('regimen-prescription', content);
					break;
				case 'lab':
				default:
					const specimen = [...results.map(r => r.item.labTest.specimens?.map(s => s.label))];

					content = {
						...data,
						lab_id: request.code,
						specimen: specimen.join(', '),
					};

					await generatePDF('lab-result', content);
					break;
			}

			return { success: true, file: `${process.env.ENDPOINT}/public/result/${filename}` };
		} catch (error) {
			console.log(error);
			return { success: false, message: error.message };
		}
	}

	async requestNursingService(param, createdBy: string) {
		try {
			const { requestType, patient_id } = param;

			const patient = await this.patientRepository.findOne(patient_id, { relations: ['hmo'] });

			const nursingRequest = await PatientRequestHelper.handleServiceRequest(param, patient, createdBy, requestType);
			if (nursingRequest.success) {
				// save transaction
				await RequestPaymentHelper.servicePayment(nursingRequest.data, patient, createdBy, requestType, param.bill);
			}

			return nursingRequest;
		} catch (error) {
			console.log(error);
			return { success: false, message: error.message };
		}
	}
}
