const { Cluster } = require('puppeteer-cluster');
const { downloadWorkerLogic } = require('./downloadlogic'); // Ensure this file exists
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

process.on('unhandledRejection', (reason, promise) => {
  console.error('🧨 Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught Exception thrown:', err);
});


// Function to create the browser pool (cluster)
async function createBrowserPool() {
   const cluster = await Cluster.launch({
    puppeteer, // ✅ هنا بتمرر puppeteer-extra المعدّل
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: 3,
   timeout: 120000,
    puppeteerOptions: {
        headless: 'new',
        // executablePath: '/usr/bin/chromium', 
          userDataDir: './user-data', // ✅ دا أهم حاجة تحافظ على الكوكيز والجلسة
        args: [
            '--disable-gpu',
            '--disable-setuid-sandbox',
            '--no-sandbox',
            '--no-zygote',
            '--disable-dev-shm-usage',
            '--disable-features=DialMediaRouteProvider',
            '--headless=new'
        ],
    },
    retryLimit: 2,
    retryDelay: 1000,
    });

    // Define the task for the cluster
    await cluster.task(async ({ page, data: { userId, downloadLink, jobId } }) => {
          page.setDefaultNavigationTimeout(60000); // ⬅️ هنا لازم تتظبط دايمًا
          console.log('Task started: browser is ready');
        const startTime = Date.now();
        try {
            if (!userId) {
                throw new Error(
                    'Message from the cluster task: userId is required. Go back and check the task you added to the queue and make sure you pass the userId'
                );
            }
            const result = await downloadWorkerLogic({ userId, downloadLink, jobId, page });
            console.log(`Task execution took ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`);
            return result;
        } catch (err) {
            console.error('Error processing job in cluster task:', err);
            throw err;
        }
    });

    // Set up event listeners for the cluster
    cluster.on('error', (err) => {
        console.error('Cluster error:', err);
    });

cluster.on('taskerror', (err, data, willRetry) => {
  console.error(`Error in job with data ${JSON.stringify(data)}: ${err.message}`);
  if (willRetry) {
    console.log('Job will be retried');
  } else {
    console.log('Job failed without retry');
  }
});


    cluster.on('taskfinish', (taskId, result) => {
        console.log(`Task ${taskId} finished with result:`, result);
    });

    return cluster;
}

module.exports = { createBrowserPool };
