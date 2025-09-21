process.on('unhandledRejection', (reason, promise) => {
  console.error('🟥 Unhandled Rejection at:', promise, '\nReason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('🟥 Uncaught Exception:', err);
});

const puppeteer = require('puppeteer-extra');
const { default: RecaptchaPlugin, BuiltinSolutionProviders } = require('puppeteer-extra-plugin-recaptcha');
const NextCaptchaProvider = require('puppeteer-extra-plugin-recaptcha-nextcaptcha');

console.log(process.env.CAP)
NextCaptchaProvider.use(BuiltinSolutionProviders);
puppeteer.use(
  RecaptchaPlugin({
    provider: {
      id: 'nextcaptcha',
      token: process.env.CAP,
    },
    visualFeedback: true,
  })
);

async function downloadWorkerLogic({ userId, downloadLink, page }) {
  let imageUrlDownload = null;
  const startTime = Date.now();

  try {
    console.log('[Init] 🚀 Starting download worker logic...');
    console.log('[Navigation] 🌐 Navigating to Freepik login page...');

    try {
      await page.goto('https://www.freepik.com/login?lang=en', { waitUntil: 'networkidle2', timeout: 60000 });
      console.log('[Navigation] ✅ Reached login page');
    } catch (err) {
      console.error('🟥 Error in page.goto login:', err);
      throw err;
    }


    const loginButtons = await page.$$('.continue-with > button');
    const isLoggedIn = loginButtons.length === 0;

    if (isLoggedIn) {
      console.log('[Session] ✅ Already logged in.');
    } else {
      console.log('[Session] 🔒 Not logged in, proceeding with login...');

      await page.waitForSelector('.continue-with > button', { timeout: 30000 });

      const buttons = await page.$$('.continue-with > button');
      let emailButton = null;

      for (const button of buttons) {
        const span = await button.$('span');
        const spanText = span && await span.evaluate(el => el.textContent?.trim());
        if (spanText === 'Continue with email') {
          emailButton = button;
          break;
        }
      }

      if (!emailButton) throw new Error('Email login button not found');
      await emailButton.click();
      console.log('[Login] 📧 Clicked "Continue with email"');

      await page.waitForSelector('input[name="email"]');
      await page.type('input[name="email"]', process.env.Login, { delay: 100 });

      await page.waitForSelector('input[name="password"]');
      await page.type('input[name="password"]', process.env.Password, { delay: 100 });

      await page.click('button#submit');
      console.log('[Login] 🔐 Submitted login credentials');
      

      console.log('[Captcha] 🧠 Solving CAPTCHA...');
      const { solved, error } = await page.solveRecaptchas();
      if (error) throw new Error('❌ Failed to solve reCAPTCHA: ' + error.message);
      console.log('[Captcha] ✅ CAPTCHA solved:', solved);

      console.log('[Navigation] ⏳ Waiting for navigation after login...');
      
      await Promise.race([
        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }),
        await new Promise(res => setTimeout(res, 15000))
      ]);

      console.log('[Navigation] ✅ Login navigation complete or fallback timeout hit');

      console.log('🌐 Current URL after login:', page.url());
      
    }

    console.log('[Download] 📦 Navigating to asset download link...');
    try {
      page.screenshot({ path: `before_navigate_${userId}.png` });
      await page.goto(downloadLink, { waitUntil: 'networkidle2', timeout: 60000 });
    } catch (err) {
      console.error('🟥 Error in page.goto downloadLink:', err);
      throw err;
    }

    console.log('[Download] ⬇️ Click download button...');
          page.screenshot({ path: `before_download_${userId}.png` });

    await page.click('[data-cy="download-button"]');

    console.log('[Waiting] 📡 Waiting for download request...');
      


    try {
    let imageUrlDownload = null;
          page.on('response', response => {
                    const url = response.url().toLowerCase();
                    console.log('[Response] 📡 Response URL:', url);
                            const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.zip', '.mp4', '.mov'];
                             if (
            validExtensions.some(ext => url.endsWith(ext)) &&
            !url.includes('cdn-front')
        ) {
            imageUrlDownload = url;
        }
    });

        await new Promise(res => setTimeout(res,Math.random() * 5000 + 3000))
   if (!imageUrlDownload) {
  throw new Error('❌ No image URL found in network response');
}

console.log('[Success] ✅ Image URL:', imageUrlDownload);
console.log(`[Done] 🎉 Job completed in ${((Date.now() - startTime) / 1000).toFixed(2)}s`);


return { success: true, imageUrl: imageUrlDownload };

}catch (err) {
  console.error('[Error] ❌ Failed to find image URL in network response:', err);
  throw new Error('❌ Failed to find image URL in network response: ' + err.message); 
}
} catch (err) {
  console.error('[Error] ❌ Worker logic failed:', err.stack || err);
  throw new Error('❌ Worker Logic Failed: ' + err.message);
}}
module.exports = { downloadWorkerLogic };
