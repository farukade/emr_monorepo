import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
import * as hbs from 'handlebars';
import * as utils from 'util';
import { SmsHistory } from '../entities/sms.entity';
import { getConnection } from 'typeorm';
import { User } from '../../modules/auth/entities/user.entity';
import { StaffDetails } from '../../modules/hr/staff/entities/staff_details.entity';
import { LogEntity } from '../../modules/logger/entities/logger.entity';
import { Appointment } from '../../modules/frontdesk/appointment/appointment.entity';
import { Patient } from '../../modules/patient/entities/patient.entity';
import { Transaction } from '../../modules/finance/transactions/transaction.entity';
import { Admission } from '../../modules/patient/admissions/entities/admission.entity';
import { TransactionCreditDto } from '../../modules/finance/transactions/dto/transaction-credit.dto';

// tslint:disable-next-line:no-var-requires
const mysql = require('mysql2/promise');

// tslint:disable-next-line:no-var-requires
const bluebird = require('bluebird');

// tslint:disable-next-line:no-var-requires
const Say = require('say').Say;
const say = new Say();

const apiKey = process.env.API_KEY;
const apiSecret = process.env.API_SECRET;

const host = process.env.MYSQL_HOST;
const user = process.env.MYSQL_USER;
const password = process.env.MYSQL_PASSWORD;
const database = process.env.MYSQL_DATABASE;

// tslint:disable-next-line:no-var-requires prefer-const
let smsglobal = require('smsglobal')(apiKey, apiSecret);

export const mysqlConnect = async () => {
	return await mysql.createConnection({ host, port: 3306, user, password, database, Promise: bluebird });
};

export const slugify = (text) => {
	return text
		.toString()
		.toLowerCase()
		.replace(/\s+/g, '-') // Replace spaces with -
		.replace(/[^\w\-]+/g, '') // Remove all non-word chars
		.replace(/\-\-+/g, '-') // Replace multiple - with single -
		.replace(/^-+/, '') // Trim - from start of text
		.replace(/-+$/, ''); // Trim - from end of text
};

export const updateImmutable = (list, payload) => {
	const data = list.find(d => d.id === payload.id);
	if (data) {
		const index = list.findIndex(d => d.id === payload.id);

		return [
			...list.slice(0, index),
			{ ...data, ...payload },
			...list.slice(index + 1),
		];
	}

	return list;
};

export const generatePDF = async (template: string, data) => {
	const readFile = utils.promisify(fs.readFile);
	const filepath = path.resolve(__dirname, `../../../views/${template}.hbs`);
	const html = await readFile(filepath, 'utf-8');
	const content = hbs.compile(html)(data);

	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();
	await page.setContent(content);

	await page.pdf({ path: data.filepath, format: 'A4' });

	await browser.close();
};

export const sentenceCase = (text) => {
	return text.toLowerCase().split(' ').map((word) => {
		return word.replace(word[0], word[0].toUpperCase());
	}).join(' ');
};

export const alphabets = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

export const sendSMS = async (phone, message) => {
	const formatedPhone = formatPhone(phone);
	const payload = {
		origin: 'DEDAHOSPITL',
		destination: formatedPhone,
		message,
	};

	// tslint:disable-next-line:only-arrow-functions
	smsglobal.sms.send(payload, async function(error, response) {
		if (response) {
			console.log(JSON.stringify(response));
			if (response.statusCode === 200) {
				const { data } = response;
				return saveHistory(formatedPhone, data, response.status);
			}
		}

		if (error) {
			console.log(error);
			const connection = getConnection();
			const queryRunner = connection.createQueryRunner();
			await queryRunner.connect();
			await queryRunner.startTransaction();
			try {
				const log = new LogEntity();
				log.phone = payload.destination;
				log.type = 'sms';
				log.message = payload.message;
				log.status = 'failed';
				log.errorMessage = error.message;

				await queryRunner.manager.save(log);
				await queryRunner.commitTransaction();
				return { success: true, log };
			} catch (err) {
				await queryRunner.rollbackTransaction();
				return { success: false, error: `${err.message || 'problem saving sms history'}` };
			} finally {
				await queryRunner.release();
			}
		}
	});
};

const saveHistory = async (phone, data, status) => {
	const connection = getConnection();
	const queryRunner = connection.createQueryRunner();
	await queryRunner.connect();
	await queryRunner.startTransaction();
	try {
		const sms = new SmsHistory();
		sms.to_phone = phone;
		sms.response = data;
		sms.status = status;
		await queryRunner.manager.save(sms);
		await queryRunner.commitTransaction();
		return { success: true, sms };
	} catch (err) {
		await queryRunner.rollbackTransaction();
		return { success: false, error: `${err.message || 'problem saving sms history'}` };
	} finally {
		await queryRunner.release();
	}
};

const formatPhone = (num) => {
	if (num[0] === '+') {
		return num;
	} else {
		let str = '+234';
		for (let i = 1; i < num.length; i++) {
			str += num[i];
		}
		return str;
	}

};

export const formatPID = (id, l: number = 8) => {
	let zeros = '';
	let len = 10;
	while (len >= 0) {
		zeros = '0' + zeros;
		len--;
	}

	return `${zeros}${String(id)}`.slice(0 - l);
};

export const getStaff = async (username: string): Promise<StaffDetails> => {
	const connection = getConnection();
	// tslint:disable-next-line:no-shadowed-variable
	const user = await connection.getRepository(User).findOne({ where: { username } });

	return await connection.getRepository(StaffDetails).findOne({
		where: { user },
		relations: ['department', 'room', 'specialization'],
	});
};

export const getOutstanding = async (patient_id) => {
	const connection = getConnection();
	const patient = await connection.getRepository(Patient).findOne(patient_id);

	const transactions = await connection.getRepository(Transaction).find({
		where: { patient, payment_type: 'self' },
	});

	return patient.credit_limit > 0 ? 0 : transactions
		.filter(t => t.status !== 1)
		.reduce((totalAmount, item) => {
			return totalAmount + item.amount;
		}, 0);
};

export const getBalance = async (patient_id) => {
	const connection = getConnection();
	const patient = await connection.getRepository(Patient).findOne(patient_id);

	const transactions = await connection.getRepository(Transaction).find({
		where: { patient, payment_type: 'self' },
	});

	return patient.credit_limit > 0 ? 0 : transactions.reduce((totalAmount, item) => {
		return totalAmount + item.amount;
	}, 0);
};

export const getLastAppointment = async (patient_id) => {
	const connection = getConnection();
	const patient = await connection.getRepository(Patient).findOne(patient_id);

	return await connection.getRepository(Appointment).findOne({
		where: { patient },
		order: { appointment_date: 'DESC' },
	});
};

export const fixAmount = (amount) => {
	const price = amount.split(',').join('');
	return amount === '' ? 0 : price;
};

const parsePID = pid => {
	const numbers = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
	return [...pid.toString()].map(p => numbers[p]).join(' ');
};

export const callPatient1 = async (pid) => {
	try {
		const text = `Patient ${parsePID(pid)}, please proceed to consulting Room 3`;
		say.speak(text, null, 1.0, (err) => {
			if (err) {
				console.error(err);
				return;
			}

			console.log('patient has been notified!');
			say.stop();
		});
	} catch (e) {
		console.log(e);
	}
};

export const callPatient = async (appointment: Appointment, room) => {
	try {
		if (process.env.DEBUG === 'false') {
			const text = `Patient ${parsePID(appointment.patient.id)}, please proceed to consulting ${room.name}`;
			say.speak(text, null, 1.0, (err) => {
				if (err) {
					console.error(err);
					return;
				}

				console.log('patient has been notified!');
				say.stop();
			});
		}
	} catch (e) {
		console.log(e);
	}
};

export const hasNumber = (myString) => {
	return /\d/.test(myString);
};

export const postDebit = async (data: TransactionCreditDto, service, voucher, requestItem, appointment, hmo) => {
	// tslint:disable-next-line:max-line-length
	const {
		patient_id,
		username,
		sub_total,
		vat,
		amount,
		voucher_amount,
		amount_paid,
		change,
		description,
		payment_method,
		part_payment_expiry_date,
		bill_source,
		next_location,
		status,
		hmo_approval_code,
		transaction_details,
		admission_id,
		staff_id,
		lastChangedBy,
	} = data;

	const connection = getConnection();

	const patient = patient_id ? await connection.getRepository(Patient).findOne(patient_id) : null;
	const admission = admission_id ? await connection.getRepository(Admission).findOne(admission_id) : null;
	const staff = staff_id ? await connection.getRepository(StaffDetails).findOne(staff_id) : null;

	const transaction = new Transaction();
	transaction.patient = patient;
	transaction.staff = staff;
	transaction.service = service;
	transaction.voucher = voucher;
	transaction.sub_total = sub_total;
	transaction.vat = vat;
	transaction.amount = amount;
	transaction.voucher_amount = voucher_amount;
	transaction.amount_paid = amount_paid;
	transaction.change = change;
	transaction.description = description;
	transaction.payment_type = (hmo.name !== 'Private') ? 'HMO' : 'self';
	transaction.payment_method = payment_method;
	transaction.transaction_type = 'debit';
	transaction.part_payment_expiry_date = part_payment_expiry_date;
	transaction.is_admitted = (admission !== null);
	transaction.bill_source = bill_source;
	transaction.next_location = next_location;
	transaction.status = admission ? -1 : status;
	transaction.hmo_approval_code = hmo_approval_code;
	transaction.transaction_details = transaction_details;
	transaction.patientRequestItem = requestItem;
	transaction.appointment = appointment;
	transaction.admission = admission;
	transaction.hmo = hmo;
	transaction.createdBy = username;
	transaction.lastChangedBy = lastChangedBy;

	return await transaction.save();
};

export const postCredit = async (data: TransactionCreditDto, service, voucher, requestItem, appointment, hmo) => {
	// tslint:disable-next-line:max-line-length
	const {
		patient_id,
		username,
		sub_total,
		vat,
		amount,
		voucher_amount,
		amount_paid,
		change,
		description,
		payment_method,
		part_payment_expiry_date,
		bill_source,
		next_location,
		status,
		hmo_approval_code,
		transaction_details,
		admission_id,
		staff_id,
		lastChangedBy,
	} = data;

	const connection = getConnection();

	const patient = patient_id ? await connection.getRepository(Patient).findOne(patient_id) : null;
	const admission = admission_id ? await connection.getRepository(Admission).findOne(admission_id) : null;
	const staff = staff_id ? await connection.getRepository(StaffDetails).findOne(staff_id) : null;

	const transaction = new Transaction();
	transaction.patient = patient;
	transaction.staff = staff;
	transaction.service = service;
	transaction.voucher = voucher;
	transaction.sub_total = sub_total;
	transaction.vat = vat;
	transaction.amount = amount;
	transaction.voucher_amount = voucher_amount;
	transaction.amount_paid = amount_paid;
	transaction.change = change;
	transaction.description = description;
	transaction.payment_type = (hmo.name !== 'Private') ? 'HMO' : 'self';
	transaction.payment_method = payment_method;
	transaction.transaction_type = 'credit';
	transaction.part_payment_expiry_date = part_payment_expiry_date;
	transaction.is_admitted = (admission !== null);
	transaction.bill_source = bill_source;
	transaction.next_location = next_location;
	transaction.status = status;
	transaction.hmo_approval_code = hmo_approval_code;
	transaction.transaction_details = transaction_details;
	transaction.patientRequestItem = requestItem;
	transaction.appointment = appointment;
	transaction.admission = admission;
	transaction.hmo = hmo;
	transaction.createdBy = username;
	transaction.lastChangedBy = lastChangedBy;

	return await transaction.save();
};
