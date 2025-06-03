
const puppeteer = require('puppeteer-extra');

const {default:RecaptchaPlugin,BuiltinSolutionProviders} = require('puppeteer-extra-plugin-recaptcha');
const NextCaptchaProvider = require('puppeteer-extra-plugin-recaptcha-nextcaptcha');

NextCaptchaProvider.use(BuiltinSolutionProviders)
// Add the Recaptcha plugin and configure it with your 2Captcha API key
puppeteer.use(
  RecaptchaPlugin({
    provider: {
      id: 'nextcaptcha',
      token: 'next_be2382784cebde8c4980cd3f688897dabf', // Replace with your 2Captcha API key
    },
    visualFeedback: true, // Optional: colorize captchas (violet = detected, green = solved)
  })
);


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

    if(userId === "warmup"){
        console.log('Warmup task executed successfully');
        return { success: true, imageUrl: null };}
    else{
    let browser;
    let imageUrlDownload = null;

    const startTime = Date.now();

        try {
            await resizeFront(page);
            await page.mouse.move(200,300);
            console.log(`resizeFront took ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`);
        } catch (err) {
            throw new Error('Viewport setup failed (front): ' + err.message);
        }

        try {
            await page.goto('https://www.freepik.com/login?lang=en', { waitUntil: 'networkidle2' });
                     const context = page.browserContext();
     
            console.log(`Navigation to login page took ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`);
        } catch (err) {
            throw new Error('Failed to navigate to login page: ' + err.message);
        }
        try {
            await resizeFront(page);
            // Take screenshot before clicking the email login button
            // await page.screenshot({ path: 'before-email-login.png', fullPage: true });

            const buttons = await page.$$('.continue-with > button');
            let emailButton = null;
            await page.mouse.move(120,340);

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

            await page.mouse.move(700,300);
            await emailButton.click();
            console.log(`Clicking email login button took ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`);
        } catch (err) {
            throw new Error('Failed to click login provider button: ' + err.message);
        }

        try {
            await page.waitForSelector('input[name="email"]', { timeout: 10000 });
            await page.type('input[name="email"]', "abdullahismael078@gmail.com");
            console.log(`Typing email took ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`);
        } catch (err) {
            throw new Error('Failed to type email: ' + err.message);
        }

        try {
            await resizeBack(page);
            await page.mouse.move(200,1000);
            console.log(`resizeBack took ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`);
        } catch (err) {
            throw new Error('Viewport setup failed (back): ' + err.message);
        }

        try {
            await resizeFront(page);
            await page.waitForSelector('input[name="password"]', { timeout: 10000 });
            await page.type('input[name="password"]', "Asdqwe123564@");
            console.log(`Typing password took ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`);
        } catch (err) {
            throw new Error('Failed to type password: ' + err.message);
        }


        try {
            await page.click('button#submit');
            console.log(`Clicking login button took ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`);
        
            // Solve reCAPTCHA using the plugin
            const { solved, error } = await page.solveRecaptchas();
            if (error) {
              throw new Error('Failed to solve reCAPTCHA: ' + error.message);
            }
            console.log('Captcha solved successfully:', solved);
        
            await page.waitForNavigation({ waitUntil: 'networkidle2' });
            console.log(`Logging in and waiting for navigation took ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`);
          } catch (err) {
            throw new Error('Failed to log in or wait for navigation: ' + err.message);
          }

        try {
            await resizeBack(page);
            console.log(`resizeFront (second time) took ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`);
        } catch (err) {
            throw new Error('Viewport setup failed (second front): ' + err.message);
        }

        try {
            await page.goto(downloadLink, { waitUntil: 'networkidle2' });
            console.log(`Navigation to download page took ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`);
        } catch (err) {
            throw new Error('Failed to navigate to download page: ' + err.message);
        }

        try {
            await page.click('[data-cy="download-button"]');
            console.log(`Clicking download button took ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`);
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


            if (!imageUrlDownload) {
                throw new Error('No image URL detected in network responses');
            }
            console.log(`Image URL captured: ${imageUrlDownload}`);
        } catch (err) {
            throw new Error('Failed to capture image download URL: ' + err.message);
        }

      

     
    return { success: true, imageUrl: imageUrlDownload };
}}

module.exports = { downloadWorkerLogic };
