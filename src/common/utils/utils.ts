import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
import * as hbs from 'handlebars';
import * as utils from 'util';

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
