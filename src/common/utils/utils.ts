import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
import * as hbs from 'handlebars';
import * as utils from 'util';
import { SmsHistory } from '../entities/sms.entity'
import {getConnection} from "typeorm";

const apiKey = process.env.API_KEY;
const apiSecret = process.env.API_SECRET;
var smsglobal = require('smsglobal')(apiKey, apiSecret);

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
    // send sms here
    const formatedPhone = format_phone(phone);
    const payload = {
        origin: 'DEDAHOSPITL',
        destination: formatedPhone,
        message
    }
    
    smsglobal.sms.send(payload, function (error, response) {
        if (response) {
            console.log(JSON.stringify(response));
            if(response.statusCode === 200){
                const { data } = response;
                return saveHistory(formatedPhone, data, response.status);
            }
          }
        
          if (error) {
             console.log(error);
          }
    });
};

const saveHistory = async (phone, data, status) => {
        const connection = getConnection();
        const queryRunner = connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const sms= new SmsHistory()
            sms.to_phone = phone;
            sms.response = data;
            sms.status = status;
            await queryRunner.manager.save(sms);
            await queryRunner.commitTransaction();
            return { success: true, sms };
        } catch (err) {
            await queryRunner.rollbackTransaction();
            return { success: false, error: `${err.message || 'problem saving sms history'}`}
        } finally {
            await queryRunner.release();
        }
}

const format_phone = (num) => {
    if(num[0] === '+')
        return num;
    else
    {
        let str = "+234";
        for(let i = 1; i <num.length; i++)
        {
            str += num[i];
        }
        return str;
    }

}