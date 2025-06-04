
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

    console.log('[Navigation] 🌐 Navigating to Freepik login page...');
    // رفع timeout لـ 60 ثانية عشان نتجنب انتهاء المهلة

try{
     await page.goto('https://www.freepik.com/login?lang=en', { waitUntil: 'networkidle2', timeout: 60000 });
   
} catch (err) {
  console.error('Error in page.goto the login page itself:', err);
  throw err; 
}
    console.log(`Navigation to login page took ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`);

    console.log('[Check Login] 🔍 Checking if already logged in...');
    await page.screenshot({ path: 's.png', fullPage: true });
    const loginButtons = await page.$$('.continue-with > button');
    isLoggedIn = loginButtons.length === 0;

    if (isLoggedIn) {
      console.log(`[Session] ✅ Already logged in, skipping login.${((Date.now() - startTime) / 1000).toFixed(2)}`);
    } else {
      console.log(`[Session] 🔒 Not logged in, performing login...${((Date.now() - startTime) / 1000).toFixed(2)}`);

      await page.waitForSelector('.continue-with > button', { timeout: 15000 });

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

      await page.waitForSelector('input[name="email"]', { timeout: 15000 });
      await page.type('input[name="email"]', "abdullahismael078@gmail.com", { delay: 100 });
      console.log(`Typing email took ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`);

      await page.waitForSelector('input[name="password"]', { timeout: 15000 });
      await page.type('input[name="password"]', "Asdqwe123564@", { delay: 100 });
      console.log(`Typing Password took ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`);

      await page.click('button#submit');
      console.log(`Clicking submit button took ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`);

      console.log('[Captcha] 🧠 Solving reCAPTCHA...');
      const { solved, error } = await page.solveRecaptchas();
      if (error) throw new Error('Failed to solve reCAPTCHA: ' + error.message);
      console.log(`[Captcha] ✅ Captcha solved: in ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`, solved);

      // هنا أرفع timeout التنقل بعد تسجيل الدخول
      try{
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });
      } catch (err) {
  console.error('Error in wait for navigation after captacha:', err);
  throw err; // لازم ترميه عشان Bull يعرف
}
      console.log(`waitForNavigation(after login) took ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`);
    }

    console.log('[Download] 📦 Navigating to download link...');
    try{
    await page.goto(downloadLink, { waitUntil: 'networkidle2', timeout: 60000 });
    } catch (err) {
  console.error('Error in page.goto:', err);
  throw err; 
}
    console.log(`Navigating to the download link took ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`);

    await page.click('[data-cy="download-button"]');
    console.log(`Clicking to the download button took ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`);

    console.log('[Waiting] 📥 Waiting for download URL...');
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

  } catch (err) {
    console.error('[Error] ❌ Error during worker logic:', err.message);
    throw new Error('❌ Worker Logic Failed: ' + err.message);
  }
}


module.exports = { downloadWorkerLogic };
