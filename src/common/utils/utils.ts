/* eslint-disable @typescript-eslint/no-var-requires */
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
import { Transaction } from '../../modules/finance/transactions/entities/transaction.entity';
import { Admission } from '../../modules/patient/admissions/entities/admission.entity';
import { TransactionCreditDto } from '../../modules/finance/transactions/dto/transaction-credit.dto';
import { HmoScheme } from '../../modules/hmo/entities/hmo_scheme.entity';
import { AccountDeposit } from '../../modules/finance/transactions/entities/deposit.entity';
import { PatientRequest } from '../../modules/patient/entities/patient_requests.entity';
import { ServiceCost } from '../../modules/settings/entities/service_cost.entity';
import { Service } from '../../modules/settings/entities/service.entity';
import { Nicu } from '../../modules/patient/nicu/entities/nicu.entity';
import { Voucher } from '../../modules/finance/vouchers/voucher.entity';
import { PatientRequestItem } from '../../modules/patient/entities/patient_request_items.entity';
import * as numeral from 'numeral';
import * as startCase from 'lodash.startcase';
import { S3Client } from '@aws-sdk/client-s3';
import { PatientNote } from 'src/modules/patient/entities/patient_note.entity';
const { log } = console;

const mysql = require('mysql2/promise');

const bluebird = require('bluebird');

const Say = require('say').Say;
const say = new Say();

require('dotenv').config();

const apiKey = process.env.API_KEY;
const apiSecret = process.env.API_SECRET;

const host = process.env.MYSQL_HOST;
const user = process.env.MYSQL_USER;
const password = process.env.MYSQL_PASSWORD;
const database = process.env.MYSQL_DATABASE;

const smsglobal = require('smsglobal')(apiKey, apiSecret);

const region = process.env.SPACES_REGION;

export const s3Client = new S3Client({
  endpoint: `https://${region}.digitaloceanspaces.com`,
  region,
  credentials: {
    accessKeyId: process.env.SPACES_ACCESS_KEY,
    secretAccessKey: process.env.SPACES_SECRET_KEY,
  },
});

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
  const data = list.find((d) => d.id === payload.id);
  if (data) {
    const index = list.findIndex((d) => d.id === payload.id);

    return [...list.slice(0, index), { ...data, ...payload }, ...list.slice(index + 1)];
  }

  return list;
};

export const generatePDF = async (template: string, data) => {
  const readFile = utils.promisify(fs.readFile);
  const filepath = path.resolve(__dirname, `../../../views/${template}.hbs`);
  const html = await readFile(filepath, 'utf-8');
  const content = hbs.compile(html)(data);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  await page.setContent(content);
  await page.emulateMediaType('screen');
  await page.pdf({ path: data.filepath, format: 'a4', preferCSSPageSize: true });
  await browser.close();
};

export const sentenceCase = (text) => {
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => {
      return word.replace(word[0], word[0].toUpperCase());
    })
    .join(' ');
};

export const alphabets = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
];

export const sendSMS = async (phone, message) => {
  const formatedPhone = formatPhone(phone);
  const payload = {
    origin: 'DEDAHOSPITL',
    destination: formatedPhone,
    message,
  };

  smsglobal.sms.send(payload, async function (error, response) {
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
        return {
          success: false,
          error: `${err.message || 'problem saving sms history'}`,
        };
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
    return {
      success: false,
      error: `${err.message || 'problem saving sms history'}`,
    };
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

export const formatPID = (id: number, l = 8) => {
  let zeros = '';
  let len = 10;
  while (len >= 0) {
    zeros = '0' + zeros;
    len--;
  }

  return `${zeros}${String(id)}`.slice(0 - l);
};

export const formatPatientId = (patient) => {
  if (!patient) {
    return '';
  }

  let formattedId = String(patient.id);
  let len = 7 - formattedId.length;
  while (len >= 0) {
    formattedId = '0' + formattedId;
    len--;
  }

  const legacyId = patient.legacy_patient_id && patient.legacy_patient_id !== '' ? ` [${patient.legacy_patient_id}]` : '';

  return `${formattedId}${legacyId}`;
};

export const getStaff = async (username: string): Promise<StaffDetails> => {
  const connection = getConnection();

  const user = await connection.getRepository(User).findOne({ where: { username } });

  return await connection.getRepository(StaffDetails).findOne({
    where: { user },
    relations: ['department', 'room', 'specialization'],
  });
};

export const getOutstanding = async (patient_id) => {
  const connection = getConnection();
  const patient = await connection.getRepository(Patient).findOne(patient_id);

  const transactions = await connection
    .getRepository(Transaction)
    .createQueryBuilder('q')
    .select('q.amount as amount, q.bill_source as bill_source')
    .where('q.patient_id = :patient_id', { patient_id })
    .andWhere("q.bill_source != 'credit-deposit'")
    .andWhere("q.bill_source != 'credit-transfer'")
    .getRawMany();

  return patient.credit_limit > 0
    ? 0
    : transactions.reduce((totalAmount, item) => {
      return totalAmount + item.amount;
    }, 0);
};

export const getBalance = async (patient_id) => {
  const connection = getConnection();

  const transactions = await connection
    .getRepository(Transaction)
    .createQueryBuilder('q')
    .select('q.amount as amount, q.bill_source as bill_source')
    .where('q.patient_id = :patient_id', { patient_id })
    .andWhere("q.bill_source != 'credit-deposit'")
    .andWhere("q.bill_source != 'credit-transfer'")
    .getRawMany();

  return transactions.reduce((totalAmount, item) => {
    return totalAmount + item.amount;
  }, 0);
};

export const getDepositBalance = async (user_id: number, isPatient: boolean) => {
  const connection = getConnection();

  let deposits = [];
  if (isPatient) {
    const patient = await connection.getRepository(Patient).findOne(user_id);

    deposits = await connection.getRepository(AccountDeposit).find({
      where: { patient },
    });
  } else {
    const staff = await connection.getRepository(StaffDetails).findOne(user_id);

    deposits = await connection.getRepository(AccountDeposit).find({
      where: { staff },
    });
  }

  return deposits.reduce((totalAmount, item) => {
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

const parsePID = (pid) => {
  const numbers = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  return [...pid.toString()].map((p) => numbers[p]).join(' ');
};

export const callPatient1 = async (pid) => {
  try {
    const text = `Patient ${parsePID(pid)}, please proceed to consulting Room 3`;
    say.speak(text, null, 1.0, (err) => {
      if (err) {
        //console.error(err);
        return;
      }

      console.log('patient has been notified!');
      say.stop();
    });
  } catch (e) {
    //console.log(e);
  }
};

export const callPatient = async (appointment: Appointment, room) => {
  try {
    if (process.env.DEBUG === 'false') {
      const text = `Patient ${parsePID(appointment.patient.id)}, please proceed to consulting ${room.name}`;
      say.speak(text, null, 1.0, (err) => {
        if (err) {
          //console.error(err);
          return;
        }

        console.log('patient has been notified!');
        say.stop();
      });
    }
  } catch (e) {
    //console.log(e);
  }
};

export const hasNumber = (myString) => {
  return /\d/.test(myString);
};

export const postDebit = async (
  data: TransactionCreditDto,
  service: ServiceCost,
  voucher: Voucher,
  requestItem: PatientRequestItem,
  appointment: Appointment,
  hmo: HmoScheme,
) => {
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
    nicu_id,
    staff_id,
    lastChangedBy,
    foodItems,
  } = data;

  const connection = getConnection();

  const patient = patient_id ? await connection.getRepository(Patient).findOne(patient_id) : null;
  const admission = admission_id ? await connection.getRepository(Admission).findOne(admission_id) : null;
  const nicu = nicu_id ? await connection.getRepository(Nicu).findOne(nicu_id) : null;
  const staff = staff_id ? await connection.getRepository(StaffDetails).findOne(staff_id) : null;

  const staffHmo = await connection.getRepository(HmoScheme).findOne(5);
  const isStaffHmo = staffHmo && hmo && staffHmo.id === hmo.id;

  let difference = 0;
  let paypoint: Transaction;
  if (hmo && hmo.coverageType !== 'full') {
    const privateHmo = await connection.getRepository(HmoScheme).findOne({ where: { name: 'Private' } });
    const privateCost = await connection.getRepository(ServiceCost).findOne({
      where: { code: service.code, hmo: privateHmo },
    });
    difference = (privateCost.tariff - Math.abs(amount)) * -1;

    if (difference > 0) {
      const _transaction = new Transaction();
      _transaction.patient = patient;
      _transaction.staff = staff;
      _transaction.service = service;
      _transaction.voucher = voucher;
      _transaction.sub_total = sub_total;
      _transaction.vat = vat;
      _transaction.amount = difference;
      _transaction.voucher_amount = voucher_amount;
      _transaction.amount_paid = amount_paid;
      _transaction.change = change;
      _transaction.description = description;
      _transaction.payment_type = 'self';
      _transaction.payment_method = payment_method;
      _transaction.transaction_type = 'debit';
      _transaction.part_payment_expiry_date = part_payment_expiry_date;
      _transaction.is_admitted = admission !== null || nicu !== null;
      _transaction.bill_source = bill_source;
      _transaction.next_location = next_location;
      _transaction.status = isStaffHmo ? -1 : admission || nicu ? -1 : status;
      _transaction.hmo_approval_code = hmo_approval_code;
      _transaction.transaction_details = transaction_details;
      _transaction.patientRequestItem = requestItem;
      _transaction.appointment = appointment;
      _transaction.admission = admission;
      _transaction.nicu = nicu;
      _transaction.hmo = hmo;
      _transaction.createdBy = username;
      _transaction.lastChangedBy = lastChangedBy;
      _transaction.foodItems = foodItems;

      paypoint = await _transaction.save();
    }
  }

  let hmo_name: string;
  if (hmo) {
    hmo_name = hmo.name !== 'Private' ? 'HMO' : 'self';
  } else {
    hmo_name = 'self';
  }

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
  transaction.payment_type = isStaffHmo ? 'self' : hmo_name;
  transaction.payment_method = payment_method;
  transaction.transaction_type = 'debit';
  transaction.part_payment_expiry_date = part_payment_expiry_date;
  transaction.is_admitted = admission !== null || nicu !== null;
  transaction.bill_source = bill_source;
  transaction.next_location = next_location;
  transaction.status = isStaffHmo ? -1 : admission || nicu ? -1 : status;
  transaction.hmo_approval_code = hmo_approval_code;
  transaction.transaction_details = transaction_details;
  transaction.patientRequestItem = requestItem;
  transaction.appointment = appointment;
  transaction.admission = admission;
  transaction.nicu = nicu;
  transaction.hmo = hmo;
  transaction.createdBy = username;
  transaction.lastChangedBy = lastChangedBy;
  transaction.foodItems = foodItems;

  const rs = await transaction.save();

  if (!paypoint) {
    paypoint = rs;
  }

  return paypoint;
};

export const postCredit = async (data: TransactionCreditDto, service, voucher, requestItem, appointment, hmo) => {
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
    nicu_id,
    staff_id,
    lastChangedBy,
    foodItems,
  } = data;

  const connection = getConnection();

  const patient = patient_id ? await connection.getRepository(Patient).findOne(patient_id) : null;
  const admission = admission_id ? await connection.getRepository(Admission).findOne(admission_id) : null;
  const nicu = nicu_id ? await connection.getRepository(Nicu).findOne(nicu_id) : null;
  const staff = staff_id ? await connection.getRepository(StaffDetails).findOne(staff_id) : null;

  const isStaffHmo = hmo ? await connection.getRepository(HmoScheme).findOne(hmo.id) : null;

  let hmo_name: string;
  if (hmo) {
    hmo_name = hmo.name !== 'Private' ? 'HMO' : 'self';
  } else {
    hmo_name = 'self';
  }

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
  transaction.payment_type = isStaffHmo ? 'self' : hmo_name;
  transaction.payment_method = payment_method;
  transaction.transaction_type = 'credit';
  transaction.part_payment_expiry_date = part_payment_expiry_date;
  transaction.is_admitted = admission !== null || nicu !== null;
  transaction.bill_source = bill_source;
  transaction.next_location = next_location;
  transaction.status = status;
  transaction.hmo_approval_code = hmo_approval_code;
  transaction.transaction_details = transaction_details;
  transaction.patientRequestItem = requestItem;
  transaction.appointment = appointment;
  transaction.admission = admission;
  transaction.nicu = nicu;
  transaction.hmo = hmo;
  transaction.createdBy = username;
  transaction.lastChangedBy = lastChangedBy;
  transaction.foodItems = foodItems;

  return await transaction.save();
};

export const getSerialCode = async (type: string) => {
  const request = await getConnection()
    .createQueryBuilder()
    .select('*')
    .from(PatientRequest, 'q')
    .where('q.requestType = :type', { type })
    .andWhere('q.serial_code is not null')
    .orderBy('q.serial_code', 'DESC')
    .withDeleted()
    .getRawOne();

  const serialCode = request?.serial_code || 0;
  return serialCode + 1;
};

export const createServiceCost = async (code: string, scheme: HmoScheme) => {
  const connection = getConnection();
  const service = await connection.getRepository(Service).findOne({ where: { code } });
  if (service) {
    const costItem = new ServiceCost();
    costItem.code = code;
    costItem.item = service;
    costItem.tariff = 0;
    costItem.hmo = scheme;
    return await costItem.save();
  }

  return null;
};

export const formatCurrency = (amount, abs = false) => `₦${numeral(abs ? Math.abs(amount) : amount).format('0,0.00')}`;

export const parseSource = (source) => (source === 'ward' ? 'Room' : startCase(source));

export const parseDescription = (item) => {
  if (!item) {
    return '--';
  }

  if (item.bill_source === 'ward' || item.bill_source === 'nicu-accommodation') {
    return `: ${item.description}`;
  }

  if (item.bill_source === 'drugs') {
    const reqItem = item.patientRequestItem;

    return ` : ${reqItem.fill_quantity} ${reqItem.drug.unitOfMeasure} of ${reqItem.drugGeneric.name} (${reqItem.drug.name
      }) at ${formatCurrency(reqItem.drugBatch.unitPrice)} each`;
  }

  if (
    (item.bill_source === 'consultancy' ||
      item.bill_source === 'labs' ||
      item.bill_source === 'scans' ||
      item.bill_source === 'procedure' ||
      item.bill_source === 'nursing-service') &&
    item.service?.item?.name
  ) {
    return `: ${item.service?.item?.name}`;
  }

  return '--';
};

export const parseDescriptionB = (item) => {
  if (!item) {
    return '--';
  }

  if (item.bill_source === 'ward' || item.bill_source === 'nicu-accommodation') {
    return ` ${item.description}`;
  }

  if (item.bill_source === 'drugs') {
    const reqItem = item.patientRequestItem;

    return `  ${reqItem.fill_quantity} ${reqItem.drug.unitOfMeasure} of ${reqItem.drugGeneric.name} (${reqItem.drug.name
      }) at ${formatCurrency(reqItem.drugBatch.unitPrice)} each`;
  }

  if (
    (item.bill_source === 'consultancy' ||
      item.bill_source === 'labs' ||
      item.bill_source === 'scans' ||
      item.bill_source === 'procedure' ||
      item.bill_source === 'nursing-service') &&
    item.service?.item?.name
  ) {
    return ` ${item.service?.item?.name}`;
  }

  return '--';
};

export const staffname = (user) => (user ? `${startCase(user?.first_name)} ${startCase(user?.last_name)}` : '--');

export const patientname = (user, pid = false) => {
  const patientId = pid ? `(${formatPatientId(user)})` : '';

  return user ? `${user.other_names} ${user.surname} ${patientId}` : '--';
};

export const removeEmptyLines = async (arr: Array<PatientNote>) => {
  const match = /(<p>(<u>|<br>)?(<br>|<u>)?<\/p>)|(\n\n(\n)?)/g;

  for (const element of arr) {
    element.description = element?.description?.replace(match, '');
  }

  return;
};

export const getChatRoomId = (arr: number[]) => {
  const sortedArr = arr.sort();
  return sortedArr.join('-');
};

export const getDiagnosis = (notes: PatientNote[]) => {
  let diagnoses = [];
  for (const note of notes) {
    if (note.diagnosis) {
      diagnoses = [...diagnoses, note.diagnosis.description]
    }
  };
  return diagnoses;
}
