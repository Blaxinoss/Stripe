const Imap = require('imap-simple');

const config = {
  imap: {
    user: "abdelrahmancfc20@gmail.com",
    password: process.env.APP_PASSWORD_GOOGLE, 
    host: "imap.gmail.com",
    port: 993,
    tls: true,
    authTimeout: 10000,
    connTimeout: 10000,
     tlsOptions: { rejectUnauthorized: false }
  }
};
async function getOtpFromEmail(maxRetries = 3, retryDelay = 10000) {
  let connection = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[OTP] 🔄 Attempt ${attempt}/${maxRetries} - Connecting to email...`);
      
      connection = await Imap.connect(config);
      await connection.openBox("INBOX");

      // بحث عن إيميلات آخر دقيقة بس (مش 5 دقائق)
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      
      const searchCriteria = [
        "UNSEEN",
        ["SINCE", oneMinuteAgo],
        ["FROM", "noreply@freepik.com"]
      ];
      
      const fetchOptions = {
        bodies: "TEXT",
        markSeen: false
      };

      console.log(`[OTP] 🔍 Searching for emails since: ${oneMinuteAgo.toLocaleTimeString()}`);
      const results = await connection.search(searchCriteria, fetchOptions);

      if (!results || results.length === 0) {
        console.log(`[OTP] ⏳ No fresh emails found on attempt ${attempt}`);
        connection.end();
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        throw new Error('No fresh verification emails found');
      }

      console.log(`[OTP] 📧 Found ${results.length} fresh email(s)`);

      // خد آخر إيميل (الأحدث)
      const latestEmail = results[results.length - 1];
      const body = latestEmail.parts.find(p => p.which === "TEXT")?.body;
      
      if (!body) {
        console.log('[OTP] ⚠️ No email body found');
        connection.end();
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        throw new Error('Email body not accessible');
      }

      // دور على OTP في الإيميل
      const otpMatch = body.match(/\b(\d{6})\b/);
      
      if (otpMatch && otpMatch[1]) {
        const otp = otpMatch[1];
        console.log('[OTP] ✅ Found OTP code:', otp);
        
        // علم الإيميل كمقروء
        try {
          await connection.addFlags(latestEmail.attributes.uid, ['\\Seen']);
        } catch (flagError) {
          console.warn('[OTP] ⚠️ Could not mark email as read');
        }
        
        connection.end();
        return otp;
      }

      console.log(`[OTP] ❌ No OTP found in latest email`);
      connection.end();
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }

    } catch (error) {
      console.error(`[OTP] ❌ Error on attempt ${attempt}:`, error.message);
      
      if (connection) {
        try {
          connection.end();
        } catch (endError) {
          // ignore
        }
      }

      if (attempt === maxRetries) {
        throw new Error(`Failed to get OTP: ${error.message}`);
      }

      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  throw new Error('Max attempts reached');
}

async function handleVerificationCode(page, verificationCode) {
  console.log('[Verification] 🔐 Handling verification code process...');
  
  if (!verificationCode || verificationCode.length !== 6 || !/^\d{6}$/.test(verificationCode)) {
    throw new Error('Invalid verification code format. Must be 6 digits.');
  }
  
  try {
    console.log('[Verification] 📧 Retrieved code:', verificationCode);
    
    // انتظار لتحميل الصفحة كاملة
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // البحث عن الـ inputs المنفصلة (6 خانات منفصلة)
    let separatedInputs = await page.$$('.input-code input');
    // page.screenshot({ path: `debug_separated_inputs_${Date.now()}.png`, fullPage: true });
    
    if (separatedInputs.length === 0) {
      const separatedSelectors = [
        '.verification-code input',
        '.code-input input',
        '.digit-input',
        'input[data-cy*="digit"]',
        'input[maxlength="1"]'
      ];
      
      for (const selector of separatedSelectors) {
        separatedInputs = await page.$$(selector);
        if (separatedInputs.length === 6) {
          console.log(`[Verification] ✅ Found 6 separated inputs with: ${selector}`);
          break;
        }
      }
    }
    
    if (separatedInputs.length === 6) {
      console.log('[Verification] 🔢 Found 6 separated input fields');
      
      // امسح أي قيم موجودة أولاً
      for (const input of separatedInputs) {
        await input.click();
        await input.evaluate(el => el.value = '');
        await page.keyboard.down('Control');
        await page.keyboard.press('KeyA');
        await page.keyboard.up('Control');
        await page.keyboard.press('Backspace');
      }
      
      // أدخل كل رقم في المكان المناسب
      for (let i = 0; i < 6; i++) {
        const digit = verificationCode[i];
        const input = separatedInputs[i];
        
        await input.click();
        await new Promise(resolve => setTimeout(resolve, 100));
        await input.type(digit, { delay: 50 });
        
        console.log(`[Verification] ✏️ Entered digit ${i + 1}: ${digit}`);
        
        // إذا كان آخر رقم، انتظر أكتر لـ auto-submit
        if (i === 5) {
          console.log('[Verification] ⏳ Last digit entered, waiting for auto-submit...');
          await new Promise(resolve => setTimeout(resolve, 3000));
        } else {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      console.log('[Verification] ✅ All 6 digits entered in separated fields');
            //   page.screenshot({ path: `debug_entered_digit_${Date.now()}.png`, fullPage: true });

      
    } else {
      console.log('[Verification] 🔍 Looking for single verification input field...');
      
      // البحث عن input واحد للكود كامل
      const inputSelectors = [
        'input[placeholder*="verification" i]',
        'input[placeholder*="6-digit" i]',
        'input[placeholder*="code" i]',
        'input[type="text"][maxlength="6"]',
        'input[name*="code" i]',
        'input[id*="code" i]',
        'input[id*="verification" i]',
        '.verification-code input[type="text"]',
        '.code-container input'
      ];
      
      let codeInput = null;
      
      for (const selector of inputSelectors) {
        try {
          codeInput = await page.$(selector);
          if (codeInput) {
            // تأكد إن الـ input visible ومتاح
            const isVisible = await codeInput.evaluate(el => {
              const rect = el.getBoundingClientRect();
              return rect.width > 0 && rect.height > 0 && 
                     !el.hidden && !el.disabled &&
                     window.getComputedStyle(el).display !== 'none';
            });
            
            if (isVisible) {
              console.log('[Verification] ✅ Found single input with selector:', selector);
              break;
            }
          }
        } catch (e) {
          continue;
        }
      }
      
      if (!codeInput) {
        // البحث اليدوي في كل الـ inputs
        console.log('[Verification] 🔍 Searching manually in all inputs...');
        const allInputs = await page.$$('input[type="text"], input[type="number"], input:not([type])');
        
        for (const input of allInputs) {
          try {
            const attributes = await input.evaluate(el => ({
              maxLength: el.getAttribute('maxlength'),
              className: el.className,
              placeholder: el.placeholder?.toLowerCase() || '',
              name: el.name?.toLowerCase() || '',
              id: el.id?.toLowerCase() || '',
              type: el.type
            }));
            
            // شروط تحديد input الكود
            const isCodeInput = 
              attributes.maxLength === '6' ||
              attributes.className.toLowerCase().includes('code') ||
              attributes.placeholder.includes('code') ||
              attributes.placeholder.includes('verification') ||
              attributes.name.includes('code') ||
              attributes.id.includes('code');
            
            if (isCodeInput) {
              const isVisible = await input.evaluate(el => {
                const rect = el.getBoundingClientRect();
                return rect.width > 0 && rect.height > 0 && !el.hidden && !el.disabled;
              });
              
              if (isVisible) {
                codeInput = input;
                console.log('[Verification] ✅ Found code input manually');
                break;
              }
            }
          } catch (e) {
            continue;
          }
        }
      }
      
      if (!codeInput) {
        throw new Error('❌ Verification code input field not found');
      }
      
      // امسح أي نص موجود وأدخل الكود
      await codeInput.click();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // امسح المحتوى بطرق متعددة
      await codeInput.evaluate(el => el.value = '');
      await page.keyboard.down('Control');
      await page.keyboard.press('KeyA');
      await page.keyboard.up('Control');
      await page.keyboard.press('Backspace');
      
      await new Promise(resolve => setTimeout(resolve, 300));
      await codeInput.type(verificationCode, { delay: 100 });
      
      console.log('[Verification] ✅ Verification code entered in single field');
      console.log('[Verification] ⏳ Waiting for auto-submit...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    // page.screenshot({ path: `debug_code_entered_${Date.now()}.png`, fullPage: true });
    
    // انتظار لأي validation أو auto-submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // تحقق من حدوث navigation بعد إدخال الكود (auto-submit)
    try {
      console.log('[Verification] 🔍 Checking for auto-submit navigation...');
      await page.waitForNavigation({ 
        waitUntil: 'domcontentloaded', 
        timeout: 8000 
      });
      console.log('[Verification] ✅ Auto-submit detected - navigation completed');
      return true;
    } catch (navError) {
      console.log('[Verification] ℹ️ No auto-submit detected, looking for submit button...');
    }
    
    // البحث عن زر الإرسال (إذا مافيش auto-submit)
    console.log('[Verification] 🔍 Looking for submit button...');
    
    const submitSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button[data-cy*="submit" i]',
      'button[data-cy*="verify" i]',
      '.submit-button',
      '.verify-button',
      '.btn-submit',
      '.btn-verify'
    ];
    
    let submitButton = null;
    
    for (const selector of submitSelectors) {
      try {
        submitButton = await page.$(selector);
        if (submitButton) {
          const isVisible = await submitButton.evaluate(el => {
            const rect = el.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0 && 
                   !el.hidden && !el.disabled &&
                   window.getComputedStyle(el).display !== 'none';
          });
          
          if (isVisible) {
            console.log('[Verification] ✅ Found submit button with:', selector);
            break;
          }
        }
      } catch (e) {
        continue;
      }
    }
    
    // إذا ما لقيناش زر submit، دور على أي button فيه كلمات معينة
    if (!submitButton) {
      console.log('[Verification] 🔍 Searching for buttons with verification text...');
      const allButtons = await page.$$('button, input[type="button"], input[type="submit"]');
      
      for (const button of allButtons) {
        try {
          const text = await button.evaluate(el => 
            el.textContent?.trim().toLowerCase() || el.value?.toLowerCase() || ''
          );
          
          const hasVerifyText = ['verify', 'submit', 'continue', 'confirm', 'send'].some(
            keyword => text.includes(keyword)
          );
          
          if (hasVerifyText) {
            const isVisible = await button.evaluate(el => {
              const rect = el.getBoundingClientRect();
              return rect.width > 0 && rect.height > 0 && !el.hidden && !el.disabled;
            });
            
            if (isVisible) {
              submitButton = button;
              console.log('[Verification] ✅ Found button with text:', text);
              break;
            }
          }
        } catch (e) {
          continue;
        }
      }
    }
    
    if (submitButton) {
      console.log('[Verification] 🚀 Clicking submit button...');
      await submitButton.click();
      console.log('[Verification] ✅ Submit button clicked');
      
      // انتظار للنتيجة
      await Promise.race([
        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }),
        page.waitForSelector('.success, .error, .invalid', { timeout: 15000 }).catch(() => null),
        new Promise(resolve => setTimeout(resolve, 10000))
      ]);
      
    } else {
      console.log('[Verification] ⚠️ No submit button found');
      
      // إذا مافيش auto-submit ولا submit button، جرب Enter
      console.log('[Verification] 🔄 Trying Enter key as fallback...');
      
      if (separatedInputs.length === 6) {
        await separatedInputs[5].focus();
      } else if (codeInput) {
        await codeInput.focus();
      }
      
      await page.keyboard.press('Enter');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // تحقق من حدوث navigation بعد Enter
      try {
        await page.waitForNavigation({ 
          waitUntil: 'domcontentloaded', 
          timeout: 5000 
        });
        console.log('[Verification] ✅ Enter key triggered navigation');
      } catch (navError) {
        console.log('[Verification] ℹ️ Enter key did not trigger navigation');
      }
    }
    
    // تحقق من وجود رسالة خطأ
    const errorSelectors = [
      '.error-message',
      '.invalid-code',
      '.verification-error',
      '[class*="error" i]',
      '[data-cy*="error" i]'
    ];
    
    for (const selector of errorSelectors) {
      try {
        const errorElement = await page.$(selector);
        if (errorElement) {
          const errorText = await errorElement.evaluate(el => el.textContent?.trim());
          if (errorText && errorText.length > 0) {
            console.log('[Verification] ❌ Error detected:', errorText);
            throw new Error(`Verification failed: ${errorText}`);
          }
        }
      } catch (e) {
        // مش مشكلة لو ما لقيناش error message
      }
    }
    
    console.log('[Verification] ✅ Verification process completed');
    // page.screenshot({ path: `verification_completed_${Date.now()}.png`, fullPage: true });
    return true;
    
  } catch (error) {
    console.error('[Verification] ❌ Error handling verification code:', error.message);
    
    // خذ screenshot للتشخيص
    try {
    //   await page.screenshot({ 
    //     path: `verification_error_${Date.now()}.png`,
    //     fullPage: true 
    //   });
      console.log('[Verification] 📷 Screenshot saved for debugging');
    } catch (screenshotError) {
      // مش مشكلة لو ما نفعش نصور
    }
    
    throw error;
  }
}

module.exports = { getOtpFromEmail, handleVerificationCode };