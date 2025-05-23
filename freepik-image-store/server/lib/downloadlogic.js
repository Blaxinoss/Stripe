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


const fetch = require('node-fetch');

async function solveRecaptcha2Captcha(page) {
  console.log('Solving reCAPTCHA using 2Captcha....');
  const sitekey = await page.$eval('.g-recaptcha', el => el.getAttribute('data-sitekey'));

  if (!sitekey) throw new Error('Sitekey not found!');
  const pageUrl = page.url();
  // 2. ارسال طلب للـ 2Captcha مع sitekey و رابط الصفحة
  const apiKey = '210a210b21e099460a8b88af8c7e06da';
  const captchaIdRes = await fetch(`http://2captcha.com/in.php?key=${apiKey}&method=userrecaptcha&googlekey=${sitekey}&pageurl=${pageUrl}`);
  const captchaIdText = await captchaIdRes.text();
  if (!captchaIdText.startsWith('OK|')) throw new Error('Failed to send captcha to 2captcha: ' + captchaIdText);
  const captchaId = captchaIdText.split('|')[1];
  let recaptchaResponse;
  for (let i = 0; i < 24; i++) { 
    await new Promise(r => setTimeout(r, 5000));

    const res = await fetch(`http://2captcha.com/res.php?key=${apiKey}&action=get&id=${captchaId}`);
    const text = await res.text();

    if (text === 'CAPCHA_NOT_READY') {
      console.log('Captcha not ready, retrying...');
      continue;
    } else if (text.startsWith('OK|')) {
      recaptchaResponse = text.split('|')[1];
      break;
    } else {
      throw new Error('Error getting captcha response: ' + text);
    }
  }

  if (!recaptchaResponse) throw new Error('Failed to solve captcha in time');

  await page.evaluate(`document.getElementById("g-recaptcha-response").style.display = "block";`); // بعض الصفحات بتخفيه
  await page.evaluate(`document.getElementById("g-recaptcha-response").value = "${recaptchaResponse}";`);

  // 5. ممكن تحتاج تحفز حدث تغيير/ادخال
  await page.evaluate(() => {
    const recaptchaElem = document.getElementById("g-recaptcha-response");
    recaptchaElem.dispatchEvent(new Event('input', { bubbles: true }));
    recaptchaElem.dispatchEvent(new Event('change', { bubbles: true }));
  });

  console.log('Captcha solved and token set');
}



async function downloadWorkerLogic({ userId, downloadLink ,page }) {
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
            await page.goto('https://www.freepik.com/login', { waitUntil: 'networkidle2' });
            console.log(`Navigation to login page took ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`);
        } catch (err) {
            throw new Error('Failed to navigate to login page: ' + err.message);
        }

        try {
             await resizeFront(page);
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

            await delay(500 + Math.random() * 500);
            await page.mouse.move(700,300);
            await emailButton.click();
            console.log(`Clicking email login button took ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`);
        } catch (err) {
            throw new Error('Failed to click login provider button: ' + err.message);
        }

        try {
            await page.waitForSelector('input[name="email"]', { timeout: 10000 });
            await delay(500);
            await page.type('input[name="email"]', "abdullahismael078@gmail.com", { delay: 100 });
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
            await delay(500);
            await page.type('input[name="password"]', "Asdqwe123564@", { delay: 100 });
            console.log(`Typing password took ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`);
        } catch (err) {
            throw new Error('Failed to type password: ' + err.message);
        }

        try {

            await page.click('button#submit');
            console.log(`Clicking login button took ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`);
            await solveRecaptcha2Captcha(page);
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
            await delay(1000);
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

            await delay(Math.random() * 5000 + 3000);

            if (!imageUrlDownload) {
                throw new Error('No image URL detected in network responses');
            }
            console.log(`Image URL captured: ${imageUrlDownload}`);
        } catch (err) {
            throw new Error('Failed to capture image download URL: ' + err.message);
        }

      

     
    return { success: true, imageUrl: imageUrlDownload };
}

module.exports = { downloadWorkerLogic };
