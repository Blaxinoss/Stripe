const {getOtpFromEmail, handleVerificationCode} = require('../utils/getOtp');

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
      token:process.env.CAP,
    },
    visualFeedback: true,
  })
);

async function downloadWorkerLogic({ userId, downloadLink, page }) {
  let detectedDownloads = []; // 📊 تجميع كل الداونلودز المكتشفة
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
      
      console.log('[Verification] 🔍 Attempting to handle verification if present...');
      
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const otpCode = await getOtpFromEmail(3, 10000);
        if (!otpCode) {
          console.log('[Verification] ℹ️ No OTP found, assuming no verification needed');
        } else {
          console.log('[Verification] ✅ OTP code retrieved:', otpCode);
          
          await handleVerificationCode(page, otpCode);
          console.log('[Verification] ✅ Verification code submitted successfully');
        }
        
      } catch (verificationError) {
        if (verificationError.message.includes('Verification code input field not found') ||
            verificationError.message.includes('No verification emails found')) {
          console.log('[Verification] ℹ️ No verification page detected, continuing normal flow...');
        } else if (verificationError.message.includes('Verification failed')) {
          console.error('[Verification] ❌ Verification failed with wrong code');
          throw verificationError;
        } else {
          console.warn('[Verification] ⚠️ Verification error (continuing anyway):', verificationError.message);
        }
      }

      await Promise.race([
        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }),
        new Promise(res => setTimeout(res, 15000))
      ]);

      console.log('[Navigation] ✅ Login navigation complete');
      console.log('🌐 Current URL after login:', page.url());
    }

    await new Promise(res => setTimeout(res, 3000));

    console.log('[Download] 📦 Navigating to asset download link...');
    try {
     await page.goto(downloadLink, { waitUntil: 'networkidle2', timeout: 120000 });
    } catch (err) {
      console.error('🟥 Error in page.goto downloadLink:', err);
      throw err;
    }

    // 📊 تحسين نظام مراقبة الـ responses
    console.log('[Monitor] 👀 Setting up download monitoring...');
    
    const responseHandler = (response) => {
      const url = response.url();
      const contentType = response.headers()['content-type'] || '';
      const contentLength = response.headers()['content-length'] || '0';
      
      // 🎯 تصنيف الملفات بناءً على الامتداد والـ content type
      const fileInfo = analyzeFileType(url, contentType);
      
      if (fileInfo.isDownloadable) {
        console.log(`[Detection] 🎯 Found ${fileInfo.type}:`, {
          url: url,
          type: fileInfo.type,
          extension: fileInfo.extension,
          contentType: contentType,
          size: contentLength,
          priority: fileInfo.priority
        });
        
        detectedDownloads.push({
          url: url,
          type: fileInfo.type,
          extension: fileInfo.extension,
          contentType: contentType,
          size: parseInt(contentLength) || 0,
          priority: fileInfo.priority,
          timestamp: Date.now()
        });
      }
    };

    page.on('response', responseHandler);

    console.log('[Download] ⬇️ Click download button...');
    await page.click('[data-cy="download-button"]');

    console.log('[Waiting] 📡 Waiting for download requests...');
    await new Promise(res => setTimeout(res, Math.random() * 7000 + 5000)); // زود الوقت شوية

    // إزالة الـ response handler
    page.off('response', responseHandler);
    
    console.log(`[Analysis] 📊 Found ${detectedDownloads.length} potential downloads:`);
    detectedDownloads.forEach((download, index) => {
      console.log(`  ${index + 1}. ${download.type} (${download.extension}) - Priority: ${download.priority}`);
      console.log(`     Size: ${download.size} bytes, URL: ${download.url.substring(0, 80)}...`);
    });

    if (detectedDownloads.length === 0) {
      throw new Error('❌ No downloadable content detected in network responses');
    }

    // 🏆 اختيار أفضل download بناءً على الـ priority والحجم
    const bestDownload = selectBestDownload(detectedDownloads);
    
    console.log(`[Selection] 🏆 Selected best download: ${bestDownload.type} (${bestDownload.extension})`);
    console.log('[Success] ✅ Final URL:', bestDownload.url);
    console.log(`[Done] 🎉 Job completed in ${((Date.now() - startTime) / 1000).toFixed(2)}s`);

    return { 
      success: true, 
      imageUrl: bestDownload.url,
      fileInfo: {
        type: bestDownload.type,
        extension: bestDownload.extension,
        size: bestDownload.size,
        contentType: bestDownload.contentType
      },
      alternativeUrls: detectedDownloads.filter(d => d.url !== bestDownload.url).map(d => d.url)
    };
    
  } catch (err) {
    console.error('[Error] ❌ Worker logic failed:', err.stack || err);
    throw new Error('❌ Worker Logic Failed: ' + err.message);
  }
}

// 🎯 دالة تحليل نوع الملف
function analyzeFileType(url, contentType) {
  const urlLower = url.toLowerCase();
  const result = {
    isDownloadable: false,
    type: 'unknown',
    extension: '',
    priority: 0
  };

  // 🚫 استبعاد الـ CDN والملفات غير المرغوبة
  if (urlLower.includes('cdn-front') || 
      urlLower.includes('avatar') || 
      urlLower.includes('thumbnail') ||
      urlLower.includes('.css') ||
      urlLower.includes('.js')) {
    return result;
  }

  // 📦 ZIP Files (أولوية عالية)
  if (urlLower.includes('.zip') || contentType.includes('zip')) {
    result.isDownloadable = true;
    result.type = 'archive';
    result.extension = 'zip';
    result.priority = 100; // أعلى أولوية
    return result;
  }

  // 🖼️ Image Files
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif', '.bmp', '.tiff'];
  const imageContentTypes = ['image/', 'img/'];
  
  if (imageExtensions.some(ext => urlLower.includes(ext)) || 
      imageContentTypes.some(type => contentType.includes(type))) {
    
    result.isDownloadable = true;
    result.type = 'image';
    
    // تحديد الامتداد
    for (const ext of imageExtensions) {
      if (urlLower.includes(ext)) {
        result.extension = ext.substring(1);
        break;
      }
    }
    
    // أولوية الصور
    if (result.extension === 'svg') result.priority = 90;
    else if (result.extension === 'png') result.priority = 85;
    else if (result.extension === 'jpg' || result.extension === 'jpeg') result.priority = 80;
    else result.priority = 75;
    
    return result;
  }

  // 🎬 Video Files
  const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
  const videoContentTypes = ['video/'];
  
  if (videoExtensions.some(ext => urlLower.includes(ext)) || 
      videoContentTypes.some(type => contentType.includes(type))) {
    
    result.isDownloadable = true;
    result.type = 'video';
    
    for (const ext of videoExtensions) {
      if (urlLower.includes(ext)) {
        result.extension = ext.substring(1);
        break;
      }
    }
    
    result.priority = 70; // أولوية متوسطة
    return result;
  }

  // 🎵 Audio Files
  const audioExtensions = ['.mp3', '.wav', '.ogg', '.aac'];
  if (audioExtensions.some(ext => urlLower.includes(ext)) || contentType.includes('audio/')) {
    result.isDownloadable = true;
    result.type = 'audio';
    result.priority = 60;
    return result;
  }

  // 📄 Other Document Files
  const docExtensions = ['.pdf', '.psd', '.ai', '.eps', '.figma'];
  if (docExtensions.some(ext => urlLower.includes(ext))) {
    result.isDownloadable = true;
    result.type = 'document';
    result.priority = 50;
    return result;
  }

  return result;
}

// 🏆 دالة اختيار أفضل download
function selectBestDownload(downloads) {
  if (downloads.length === 0) {
    throw new Error('No downloads available for selection');
  }

  // 🔄 ترتيب حسب الأولوية ثم الحجم
  downloads.sort((a, b) => {
    // الأولوية أولاً
    if (a.priority !== b.priority) {
      return b.priority - a.priority;
    }
    // ثم الحجم (الأكبر أفضل للصور والملفات)
    return b.size - a.size;
  });

  console.log('[Selection] 🔍 Download ranking:');
  downloads.forEach((download, index) => {
    console.log(`  ${index + 1}. ${download.type} - Priority: ${download.priority}, Size: ${download.size}`);
  });

  return downloads[0];
}

module.exports = { downloadWorkerLogic };