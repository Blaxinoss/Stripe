const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');


puppeteer.use(StealthPlugin());

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function resizeFront(page) {
    try {
        const width = Math.floor(Math.random() * 200) + 1300;
        const height = Math.floor(Math.random() * 200) + 800;
        await page.setViewport({ width, height });
    } catch (err) {
        throw new Error('Failed to resize viewport (front): ' + err.message);
    }
}

async function resizeBack(page) {
    try {
        const width = Math.floor(Math.random() * 150) + 1100;
        const height = Math.floor(Math.random() * 150) + 600;
        await page.setViewport({ width, height });
    } catch (err) {
        throw new Error('Failed to resize viewport (back): ' + err.message);
    }
}

async function downloadWorkerLogic({ userId, downloadLink ,page }) {
    let browser;
    let imageUrlDownload = null;

    try {
        try {
            browser = await puppeteer.launch({
                headless: false,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-blink-features=AutomationControlled',
                    '--disable-infobars',
                ],
                defaultViewport: null,
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
            await resizeFront(page);
        } catch (err) {
            throw new Error('Viewport setup failed (front): ' + err.message);
        }

        try {
            await page.goto('https://www.freepik.com/login', { waitUntil: 'networkidle2' });
        } catch (err) {
            throw new Error('Failed to navigate to login page: ' + err.message);
        }

        try {
            const buttons = await page.$$('.continue-with > button');
            let emailButton = null;

            for (const button of buttons) {
                const span = await button.$('span');
                if (!span) continue;

                const spanText = await span.evaluate(el => el.textContent.trim());
                if (spanText === 'Continue with email') {
                    emailButton = button;
                    break;
                }
            }

            if (!emailButton) {
                throw new Error('Email login button not found');
            }

            await delay(500 + Math.random() * 500);
            await emailButton.click();
        } catch (err) {
            throw new Error('Failed to click login provider button: ' + err.message);
        }

        try {
            await page.waitForSelector('input[name="email"]', { timeout: 10000 });
            await delay(500);
            await page.type('input[name="email"]', "abdullahismael078@gmail.com", { delay: 100 });
        } catch (err) {
            throw new Error('Failed to type email: ' + err.message);
        }

        try {
            await resizeBack(page);
        } catch (err) {
            throw new Error('Viewport setup failed (back): ' + err.message);
        }

        try {
            await page.waitForSelector('input[name="password"]', { timeout: 10000 });
            await delay(500);
            await page.type('input[name="password"]', "Asdqwe123564@", { delay: 100 });
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
            await resizeFront(page);
        } catch (err) {
            throw new Error('Viewport setup failed (second front): ' + err.message);
        }

        try {
            await page.goto(downloadLink, { waitUntil: 'networkidle2' });
        } catch (err) {
            throw new Error('Failed to navigate to download page: ' + err.message);
        }

        try {
            await delay(1000);
            await page.click('[data-cy="download-button"]');
        } catch (err) {
            throw new Error('Failed to click download button: ' + err.message);
        }

        try {
            page.on('response', response => {
                const url = response.url();
                if (url.endsWith('.jpg') || url.endsWith('.png')|| url.endsWith('.zip')) {
                    imageUrlDownload = url;
                }
            });

            await delay(Math.random() * 5000 + 3000);

            if (!imageUrlDownload) {
                throw new Error('No image URL detected in network responses');
            }
        } catch (err) {
            throw new Error('Failed to capture image download URL: ' + err.message);
        }

      

        return { success: true, imageUrl: imageUrlDownload };

    } catch (err) {
        throw err;
    } finally {
        if (browser) await browser.close();
    }
}

module.exports = { downloadWorkerLogic };
