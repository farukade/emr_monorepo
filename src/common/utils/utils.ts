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

export const fixAmount = (amount) => {
    const price = amount.split(',').join('');
    return amount === '' ? 0 : price;
};

export const callPatient = async (appointment: Appointment, room) => {
    try {
        if (process.env.DEBUG === 'false') {
            const text = `Patient ${appointment.patient.id}, please proceed to consulting ${room.name}`;
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
