// ضيف السطور دي في أعلى ملف worker أو الملف الرئيسي
const fs = require('fs');
process.on('unhandledRejection', (reason, promise) => {
  console.error('🟥 Unhandled Rejection at:', promise, '\nReason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('🟥 Uncaught Exception:', err);
});

const puppeteer = require('puppeteer-extra');
const { default: RecaptchaPlugin, BuiltinSolutionProviders } = require('puppeteer-extra-plugin-recaptcha');
const NextCaptchaProvider = require('puppeteer-extra-plugin-recaptcha-nextcaptcha');

NextCaptchaProvider.use(BuiltinSolutionProviders);
puppeteer.use(
  RecaptchaPlugin({
    provider: {
      id: 'nextcaptcha',
      token: 'next_be2382784cebde8c4980cd3f688897dabf',
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

    await page.screenshot({ path: 's.png', fullPage: true });

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
      await page.type('input[name="email"]', 'abdullahismael078@gmail.com', { delay: 100 });

      await page.waitForSelector('input[name="password"]');
      await page.type('input[name="password"]', 'Asdqwe123564@', { delay: 100 });

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
      await page.goto(downloadLink, { waitUntil: 'networkidle2', timeout: 60000 });
    } catch (err) {
      console.error('🟥 Error in page.goto downloadLink:', err);
      throw err;
    }
    fs.writeFileSync(`s.html`, `${downloadLink}`)

    console.log('[Download] ⬇️ Click download button...');
    await page.click('[data-cy="download-button"]');

    console.log('[Waiting] 📡 Waiting for download request...');
    page.screenshot({ path: `s.png`, fullPage: true });

   const response = await page.waitForResponse(res => {
  const url = res.url();
  const pathname = new URL(url).pathname.toLowerCase();
  console.log('🔍 response URL:', url);

  return (
    (
      pathname.endsWith('.jpg') ||
      pathname.endsWith('.png') ||
      pathname.endsWith('.psg') ||
      pathname.endsWith('.ico') ||
      pathname.endsWith('.eps') ||
      pathname.endsWith('.zip') ||
      pathname.endsWith('.jpeg') ||
      pathname.endsWith('.svg')
    ) &&
    !url.includes('cdn') &&
    !url.includes('pricing')
  );
}, { timeout: 30000 });

const imageUrlDownload = response.url();

if (!imageUrlDownload) {
  throw new Error('❌ No image URL found in network response');
}

console.log('[Success] ✅ Image URL:', imageUrlDownload);
console.log(`[Done] 🎉 Job completed in ${((Date.now() - startTime) / 1000).toFixed(2)}s`);

return { success: true, imageUrl: imageUrlDownload };

} catch (err) {
  console.error('[Error] ❌ Worker logic failed:', err.stack || err);
  throw new Error('❌ Worker Logic Failed: ' + err.message);
}