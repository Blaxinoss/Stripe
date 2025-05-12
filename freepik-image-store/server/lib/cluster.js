const { Cluster } = require('puppeteer-cluster');
const { downloadWorkerLogic } = require('./downloadlogic');  // يجب أن يكون لديك هذا الملف

// دالة لإنشاء المسبح (cluster)
async function createBrowserPool() {
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_PAGE, // One page per browser instance
        maxConcurrency: 3, // Limit to 3 concurrent pages
        puppeteerOptions: {
            headless: true, // Ensure headless mode
            executablePath: '/usr/bin/chromium', // Use system Chromium
            args: [
                '--no-sandbox', // Required for Docker
                '--disable-setuid-sandbox', // Required for Docker
                '--disable-dev-shm-usage', // Avoid shared memory issues
                '--disable-gpu', // Disable GPU in headless mode
                '--disable-background-networking', // Reduce resource usage
                '--disable-background-timer-throttling',
                '--disable-breakpad',
                '--disable-client-side-phishing-detection',
                '--disable-default-apps',
                '--disable-extensions',
                '--disable-hang-monitor',
                '--disable-popup-blocking',
                '--disable-prompt-on-repost',
                '--disable-sync',
                '--disable-translate',
                '--metrics-recording-only',
                '--no-first-run',
                '--safebrowsing-disable-auto-update'
            ],
            timeout: 120000, // 120 seconds timeout
        },
        retryLimit: 2, // Retry failed tasks up to 2 times
        retryDelay: 1000, // Wait 1 second between retries
    });

    return cluster;
}
    // تنفيذ الكود الذي يجب على الـ cluster فعله عند استقبال job
    await cluster.task(async ({ page, data: { userId, downloadLink,jobId } }) => {
        try {
            if (!userId ) {
                throw new Error('Message from the cluster task: userId is required go back and check the task you add to the queue and make sure you pass the userId');
            }
            const result = await downloadWorkerLogic({ userId, downloadLink, jobId,page });
            return result;
        } catch (err) {
            console.error('Error processing job in cluster task:', err);
            throw err;
        }
        
    });



    cluster.on('error', (err) => {
        console.error('Cluster error:', err);
    });

    cluster.on('taskerror', (err) => {
        console.error('Task error:', err);
    });

    cluster.on('taskfinish', (taskId, result) => {
        console.log(`Task ${taskId} finished with result:`, result);
    });

    return cluster;
}

module.exports = { createBrowserPool };
