
const puppeteer = require('puppeteer-extra');
const ImageModel = require('../models/ImageModel');

interface DownloadJobArgs {
    userId: string;      // نوع الـ userId
    downloadLink: string; // نوع الـ downloadLink
    page: any;
}

export async function downloadWorkerLogic({ userId, downloadLink, page }: DownloadJobArgs) {
    let browser;
    let imageUrlDownload = null;


    try {
        try {
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        } catch (err) {
            throw new Error('Failed to launch browser: ' + err.message);
        }

        try {
            page = await browser.newPage();
        } catch (err) {
            throw new Error('Failed to open new page: ' + err.message);
        }

        try {
            await page.goto('https://www.freepik.com/login', { waitUntil: 'networkidle2' });
        } catch (err) {
            throw new Error('Failed to navigate to login page: ' + err.message);
        }

        try {
            const buttons = await page.$$('.continue-with > button');
            if (buttons.length < 2) {
                throw new Error('Login buttons not found');
            }
            await buttons[1].click();
        } catch (err) {
            throw new Error('Failed to click login provider button: ' + err.message);
        }

        try {
            await page.waitForSelector('input[name="email"]', { timeout: 10000 });
            await page.type('input[name="email"]', process.env.Login, { delay: 100 });
        } catch (err) {
            throw new Error('Failed to type email: ' + err.message);
        }

        try {
            await page.waitForSelector('input[name="password"]', { timeout: 10000 });
            await page.type('input[name="password"]', process.env.Password, { delay: 100 });
        } catch (err) {
            throw new Error('Failed to type password: ' + err.message);
        }

        try {
            await page.click('.submit > button');
            await page.waitForNavigation({ waitUntil: 'networkidle2' });
        } catch (err) {
            throw new Error('Failed to log in or wait for navigation: ' + err.message);
        }

        try {
            await page.goto(downloadLink, { waitUntil: 'networkidle2' });
        } catch (err) {
            throw new Error('Failed to navigate to download page: ' + err.message);
        }

        try {
            await page.click('[data-cy="download-button"]');
        } catch (err) {
            throw new Error('Failed to click download button: ' + err.message);
        }

        try {
            page.on('response', response => {
                const url = response.url();
                if (url.endsWith('.jpg') || url.endsWith('.png')) {
                    imageUrlDownload = url;
                }
            });

            await new Promise(resolve => setTimeout(resolve, Math.random() * 5000 + 3000));

            if (!imageUrlDownload) {
                throw new Error('No image URL detected in network responses');
            }
        } catch (err) {
            throw new Error('Failed to capture image download URL: ' + err.message);
        }

        try {
            const newImage = new ImageModel({
                userId,
                downloadUrl: imageUrlDownload,
                downloadCount: 0,
                maxDownloads: 3,
            });
            await newImage.save();
        } catch (err) {
            throw new Error('Failed to save image in DB: ' + err.message);
        }


        return imageUrlDownload;

    } catch (err) {
        throw err;
    } finally {
        if (browser) await browser.close();
    }
}

