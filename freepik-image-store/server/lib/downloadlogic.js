
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



// async function resizeFront(page) {
//     try {
//         const width = Math.floor(Math.random() * 200) + 1300;
//         const height = Math.floor(Math.random() * 200) + 800;
//         await page.setViewport({ width, height });
//     } catch (err) {
//         throw new Error('Failed to resize viewport (front): ' + err.message);
//     }
// }

// async function resizeBack(page) {
//     try {
//         const width = Math.floor(Math.random() * 150) + 1100;
//         const height = Math.floor(Math.random() * 150) + 600;
//         await page.setViewport({ width, height });
//     } catch (err) {
//         throw new Error('Failed to resize viewport (back): ' + err.message);
//     }
// }


async function downloadWorkerLogic({ userId, downloadLink, page }) {
  if (userId === "warmup") {
    console.log('[Warmup] ✅ Warmup task executed successfully');
    return { success: true, imageUrl: null };
  }

  let imageUrlDownload = null;
  const startTime = Date.now();


  try {
        let isLoggedIn = false;

    console.log('[Init] 🚀 Starting download worker logic...');

    // await resizeFront(page);
    // await page.mouse.move(200, 300);
    // logStep('resizeFront (initial)');

    console.log('[Navigation] 🌐 Navigating to Freepik login page...');
    await page.goto('https://www.freepik.com/login?lang=en', { waitUntil: 'networkidle2' });
     console.log(`Navigation to login page took ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`);
    console.log('[Check Login] 🔍 Checking if already logged in...');
    await page.screenshot({ path: 's.png', fullPage: true });
    const loginButtons = await page.$$('.continue-with > button');
    if( loginButtons.length > 0) {
      isLoggedIn = false;
    }         

    if (isLoggedIn) {
      console.log(`[Session] ✅ Already logged in, skipping login.${((Date.now() - startTime) / 1000).toFixed(2)}`);

    } else {
      console.log(`[Session] 🔒 Not logged in, performing login...${((Date.now() - startTime) / 1000).toFixed(2)}`);

    await page.waitForSelector('.continue-with > button', { timeout: 10000 });
    let emailButton = null;
    const buttons = await page.$$('.continue-with > button');

    for (const button of buttons) {
    const span = await button.$('span');
    if (!span) continue;

    const spanText = await span.evaluate(el => el.textContent?.trim());
    if (spanText === 'Continue with email') {
        emailButton = button;
        break;
    }
    }

      if (!emailButton) throw new Error('Email login button not found');
      await emailButton.click();
        console.log(`Clicking email login button took ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`);
      await page.waitForSelector('input[name="email"]', { timeout: 10000 });
      await page.type('input[name="email"]', "abdullahismael078@gmail.com", { delay: 100 });
        console.log(`Typing email took ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`);

      await page.waitForSelector('input[name="password"]', { timeout: 10000 });
      await page.type('input[name="password"]', "Asdqwe123564@", { delay: 100 });
        console.log(`Typing Password took ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`);

      await page.click('button#submit');
        console.log(`Clicking sumbit button took ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`);

      console.log('[Captcha] 🧠 Solving reCAPTCHA...');
      const { solved, error } = await page.solveRecaptchas();
      if (error) throw new Error('Failed to solve reCAPTCHA: ' + error.message);
      console.log(`[Captcha] ✅ Captcha solved: in ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`, solved);

      await page.waitForNavigation({ waitUntil: 'networkidle2' });
              console.log(`waitForNavigation(after login) took ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`);

    }

   

    console.log('[Download] 📦 Navigating to download link...');
    await page.goto(downloadLink, { waitUntil: 'networkidle2' });
    logStep('goto(downloadLink)');
              console.log(`navigating to the download link took ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`);

    await page.click('[data-cy="download-button"]');
              console.log(`clicking to the download button took ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`);

    console.log('[Waiting] 📥 Waiting for download URL...');
    const response = await page.waitForResponse(
      res => {
        const url = res.url();
        return url.endsWith('.jpg') || url.endsWith('.png') || url.endsWith('.zip');
      },
      { timeout: 10000 }
    );

    imageUrlDownload = response.url();
    if (!imageUrlDownload) throw new Error('No image URL detected in network responses');
    console.log('[Success] ✅ Image URL captured:', imageUrlDownload);
              console.log(`captured Image successfully after ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`);


    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[Done] 🎉 Finished job in ${totalTime} seconds`);

    return { success: true, imageUrl: imageUrlDownload };

  } catch (err) {
    console.error('[Error] ❌ Error during worker logic:', err.message);
    throw new Error('❌ Worker Logic Failed: ' + err.message);
  }
}


module.exports = { downloadWorkerLogic };
